import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await page.getByRole('textbox', { name: 'name@club.com' }).click();
    await page.getByRole('textbox', { name: 'name@club.com' }).fill('admin@gmail.com');
    await page.getByRole('textbox', { name: 'name@club.com' }).press('Tab');
    await page.getByRole('textbox', { name: 'Nhập mật khẩu' }).fill('123456');
    await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();
    await page.getByRole('link', { name: 'sports_tennis Quản lý Sân' }).click();
    await page.getByRole('link', { name: 'event_available Quản lý' }).click();
    await page.getByRole('row', { name: 'BK-59423620 Dương Minh Tâm' }).getByRole('button').click();
    await page.getByRole('button', { name: 'close' }).click();
});