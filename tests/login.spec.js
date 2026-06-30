import { test, expect } from '@playwright/test';

test('Admin Full Flow Navigation Test', async ({ page }) => {
    // 1. Go to Home page and click Login
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // 2. Fill login credentials
    await page.getByRole('textbox', { name: 'name@club.com' }).fill('admin@gmail.com');
    await page.getByRole('textbox', { name: 'Nhập mật khẩu' }).fill('123456');
    await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();

    // 3. Wait for redirect and check Dashboard page
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.getByRole('heading', { name: 'Dashboard tổng quan' })).toBeVisible();

    // 4. Click Sân and verify Court Management page loads
    await page.getByRole('link', { name: 'sports_tennis Sân' }).click();
    await expect(page).toHaveURL(/.*courts/);
    await expect(page.getByRole('heading', { name: 'Quản lý Sân' })).toBeVisible();

    // 5. Click Booking and verify Booking Management page loads
    await page.getByRole('link', { name: 'event_available Booking' }).click();
    await expect(page).toHaveURL(/.*bookings/);
    await expect(page.getByRole('heading', { name: 'Quản lý Booking' })).toBeVisible();

    // 6. Click Thiết bị and verify Equipment Management page loads
    await page.getByRole('link', { name: 'inventory_2 Thiết bị' }).click();
    await expect(page).toHaveURL(/.*equipments/);
    await expect(page.getByRole('heading', { name: 'Quản lý Kho & Thiết bị' })).toBeVisible();

    // 7. Click Bảo trì and verify Maintenance page loads
    await page.getByRole('link', { name: 'build Bảo trì' }).click();
    await expect(page).toHaveURL(/.*maintenance/);
    await expect(page.getByRole('heading', { name: 'Quản lý Bảo trì' })).toBeVisible();

    // 8. Click Người dùng and verify Users Management page loads
    await page.getByRole('link', { name: 'group Người dùng' }).click();
    await expect(page).toHaveURL(/.*users/);
    await expect(page.getByRole('heading', { name: 'Quản lý Người dùng' })).toBeVisible();

    // 9. Click Mã giảm giá and verify Coupon Management page loads
    await page.getByRole('link', { name: 'sell Mã giảm giá' }).click();
    await expect(page).toHaveURL(/.*coupons/);
    await expect(page.getByRole('heading', { name: 'Quản lý mã giảm giá' })).toBeVisible();

    // 10. Click Đánh giá and verify Review Approval page loads
    await page.getByRole('link', { name: 'rate_review Đánh giá' }).click();
    await expect(page).toHaveURL(/.*reviews/);
    await expect(page.getByRole('heading', { name: 'Duyệt đánh giá' })).toBeVisible();

    // 11. Click Cấu hình and verify Settings page loads
    await page.getByRole('link', { name: 'settings Cấu hình' }).click();
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.getByRole('heading', { name: 'Cấu hình Hệ thống' })).toBeVisible();

    // 12. Click Hồ sơ and verify Profile page loads
    await page.getByRole('link', { name: 'account_circle Hồ sơ' }).click();
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.getByRole('heading', { name: 'Hồ sơ quản trị viên' })).toBeVisible();
});


test('Admin Full Flow Navigation Automated Test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByRole('textbox', { name: 'name@club.com' }).click();
  await page.getByRole('textbox', { name: 'name@club.com' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'name@club.com' }).press('Tab');
  await page.getByRole('textbox', { name: 'Nhập mật khẩu' }).fill('123456');
  await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByRole('link', { name: 'sports_tennis Sân' }).click();
  await page.getByRole('link', { name: 'event_available Booking' }).click();
  await page.getByRole('link', { name: 'inventory_2 Thiết bị' }).click();
  await page.getByRole('button', { name: 'Đơn nhập kho (Từ Vendor)' }).click();
  await page.getByRole('link', { name: 'build Bảo trì' }).click();
  await page.getByRole('link', { name: 'group Người dùng' }).click();
  await page.getByRole('link', { name: 'sell Mã giảm giá' }).click();
  await page.getByRole('link', { name: 'rate_review Đánh giá' }).click();
  await page.getByRole('link', { name: 'account_circle Hồ sơ' }).click();
  await page.getByRole('link', { name: 'settings Cấu hình' }).click();
  await page.getByRole('button', { name: 'notifications' }).click();
  await page.getByRole('button', { name: 'logout Đăng xuất' }).click();
});

test('User Full Flow Navigation Automated Test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByRole('textbox', { name: 'name@club.com' }).click();
  await page.getByRole('textbox', { name: 'name@club.com' }).fill('user1@gmail.com');
  await page.getByRole('textbox', { name: 'Nhập mật khẩu' }).click();
  await page.getByRole('textbox', { name: 'Nhập mật khẩu' }).fill('123456');
  await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByRole('link', { name: 'sports_tennis Sân bóng' }).click();
  await page.getByRole('link', { name: 'favorite Yêu thích' }).click();
  await page.getByRole('link', { name: 'workspace_premium Ưu đãi' }).click();
  await page.getByRole('button', { name: 'notifications' }).click();
  await page.getByRole('link', { name: 'user1 user1 Người chơi' }).click();
  await page.getByRole('button', { name: 'add_circle Đặt sân', exact: true }).click();
  await page.getByRole('button', { name: 'logout' }).click();
});