import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";
import Court from "../models/court.model.js";
import RewardLog from "../models/rewardLog.model.js";
import pointsService from "./points.service.js";
import notificationService from "./notification.service.js";
import mongoose from "mongoose";

const REVIEW_REWARD_POINTS = parseInt(process.env.REVIEW_REWARD_POINTS || "20", 10);

class ReviewService {
    async updateCourtStats(courtId) {
        const stats = await Review.aggregate([
            {
                $match: {
                    courtId: typeof courtId === "string"
                        ? new mongoose.Types.ObjectId(courtId)
                        : courtId,
                    status: "APPROVED"
                }
            },
            {
                $group: {
                    _id: "$courtId",
                    reviewCount: { $sum: 1 },
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        const nextStats = stats[0] || { reviewCount: 0, averageRating: 0 };
        await Court.findByIdAndUpdate(courtId, {
            $set: {
                reviewCount: nextStats.reviewCount,
                averageRating: Number((nextStats.averageRating || 0).toFixed(1))
            }
        });
    }

    async getEligibility(userId, courtId) {
        const completedBookings = await Booking.find({
            userId,
            courtId,
            status: "COMPLETED",
            paymentStatus: "PAID"
        }).sort({ bookingDate: -1 });

        const bookingIds = completedBookings.map(booking => booking._id);
        const existingReviews = await Review.find({
            userId,
            courtId,
            bookingId: { $in: bookingIds },
            status: { $ne: "DELETED" }
        }).select("bookingId");

        const reviewedBookingIds = new Set(existingReviews.map(review => review.bookingId.toString()));
        const eligibleBookings = completedBookings.filter(booking => !reviewedBookingIds.has(booking._id.toString()));

        return {
            canReview: eligibleBookings.length > 0,
            eligibleBookings
        };
    }

    async createReview(userId, payload) {
        const { courtId, bookingId, rating, comment = "", images = [] } = payload;

        const booking = await Booking.findOne({
            _id: bookingId,
            userId,
            courtId,
            status: "COMPLETED",
            paymentStatus: "PAID"
        });

        if (!booking) {
            throw new Error("Bạn chỉ có thể đánh giá sau khi đã đặt sân, thanh toán và hoàn tất lượt chơi!");
        }

        const review = await Review.create({
            userId,
            courtId,
            bookingId,
            rating,
            comment,
            images,
            status: "APPROVED"
        });

        await this.updateCourtStats(courtId);

        await pointsService.earn(userId, REVIEW_REWARD_POINTS, {
            referenceId: review._id,
            referenceType: "Review",
            description: "Thưởng điểm khi đánh giá sân"
        });

        await RewardLog.create({
            userId,
            rewardType: "POINT",
            points: REVIEW_REWARD_POINTS,
            reason: "REVIEW_REWARD",
            referenceId: review._id,
            referenceType: "Review"
        });

        await notificationService.createForUser({
            userId,
            title: "Bạn đã nhận điểm thưởng",
            message: `Cảm ơn bạn đã đánh giá sân. Hệ thống đã cộng ${REVIEW_REWARD_POINTS} điểm vào ví tích lũy.`,
            type: "POINT",
            referenceId: review._id,
            referenceType: "Review"
        });

        await notificationService.createForAdmins({
            title: "Có đánh giá sân mới",
            message: `Một khách hàng vừa đánh giá ${rating} sao cho mã booking ${booking.bookingCode}.`,
            type: "REVIEW",
            referenceId: review._id,
            referenceType: "Review"
        });

        return {
            message: `Đánh giá thành công. Bạn nhận được ${REVIEW_REWARD_POINTS} điểm thưởng!`,
            rewardPoints: REVIEW_REWARD_POINTS,
            review
        };
    }

    async getReviewsByCourt(courtId, query = {}) {
        const page = parseInt(query.page, 10) || 1;
        const limit = Math.min(parseInt(query.limit, 10) || 10, 50);
        const skip = (page - 1) * limit;

        const filter = {
            courtId,
            status: "APPROVED"
        };

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .populate("userId", "fullName avatar")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments(filter)
        ]);

        return {
            reviews,
            pagination: {
                totalItems: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                limit
            }
        };
    }

    async getAdminReviews(query = {}) {
        const filter = {};
        if (query.status) filter.status = query.status.toUpperCase();
        if (query.courtId) filter.courtId = query.courtId;

        const reviews = await Review.find(filter)
            .populate("userId", "fullName email avatar")
            .populate("courtId", "name location")
            .populate("bookingId", "bookingCode status paymentStatus")
            .sort({ createdAt: -1 })
            .limit(100);

        return { reviews };
    }

    async getMyBookingReview(userId, bookingId) {
        const review = await Review.findOne({
            userId,
            bookingId,
            status: { $ne: "DELETED" }
        });
        return { review: review || null, hasReview: !!review };
    }

    async updateReviewStatus(reviewId, status) {
        const nextStatus = status?.toUpperCase();
        if (!["PENDING", "APPROVED", "HIDDEN", "DELETED"].includes(nextStatus)) {
            throw new Error("Trạng thái đánh giá không hợp lệ!");
        }

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $set: { status: nextStatus } },
            { new: true }
        );
        if (!review) throw new Error("Đánh giá không tồn tại!");

        await this.updateCourtStats(review.courtId);
        return { message: "Cập nhật trạng thái đánh giá thành công!", review };
    }
}

export default new ReviewService();
