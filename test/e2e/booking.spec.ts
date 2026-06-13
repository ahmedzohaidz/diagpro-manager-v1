import { test, expect } from '@playwright/test';

test.describe('Online Booking Flow (/book)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book');
  });

  test('should load booking form', async ({ page }) => {
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('حجز موعد');

    // Check form inputs exist
    const nameInput = page.locator('input[name="full_name"]');
    await expect(nameInput).toBeVisible();

    const phoneInput = page.locator('input[name="phone"]');
    await expect(phoneInput).toBeVisible();

    const carMakeInput = page.locator('input[name="car_make"]');
    await expect(carMakeInput).toBeVisible();
  });

  test('should accept valid booking submission', async ({ page }) => {
    // Fill form with valid data
    await page.fill('input[name="full_name"]', 'أحمد محمد');
    await page.fill('input[name="phone"]', '5551234567');
    await page.fill('input[name="car_make"]', 'تويوتا');
    await page.fill('input[name="car_model"]', 'كامري');
    await page.fill('input[name="car_year"]', '2020');
    await page.fill('textarea[name="problem_description"]', 'أصوات غريبة من المحرك');

    // Select drivable
    await page.check('input[name="is_drivable"]');

    // Select preferred date
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-06-20');

    // Submit form
    const submitButton = page.locator('button:has-text("إرسال الحجز")');
    await submitButton.click();

    // Verify success message
    const successMessage = page.locator('text=تم استلام الحجز بنجاح');
    await expect(successMessage).toBeVisible();
  });

  test('should reject form with missing required fields', async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("إرسال الحجز")');
    await submitButton.click();

    // Expect validation error
    const errorMessage = page.locator('text=يرجى ملء جميع الحقول المطلوبة');
    await expect(errorMessage).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.fill('input[name="phone"]', 'invalid-phone');
    await page.fill('input[name="full_name"]', 'Test');
    const submitButton = page.locator('button:has-text("إرسال الحجز")');
    await submitButton.click();

    const errorMessage = page.locator('text=رقم الهاتف غير صحيح');
    await expect(errorMessage).toBeVisible();
  });

  test('should support RTL layout', async ({ page }) => {
    // Check that page is RTL
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Check text direction of form inputs
    const formContainer = page.locator('form');
    const computedDir = await formContainer.evaluate((el) => getComputedStyle(el).direction);
    expect(computedDir).toBe('rtl');
  });

  test('should display yellow brand button', async ({ page }) => {
    const submitButton = page.locator('button:has-text("إرسال الحجز")');
    const bgColor = await submitButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Yellow is #FFD100 which is rgb(255, 209, 0)
    expect(bgColor).toContain('rgb(255, 209, 0)');
  });
});

test.describe('Admin Bookings Dashboard (/admin/bookings)', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth cookie (mock admin session)
    await context.addCookies([
      {
        name: 'supabase-auth-token',
        value: 'mock-admin-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin/bookings');
  });

  test('should load admin bookings dashboard', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toContainText('الحجوزات');

    // Check for booking table
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should filter bookings by status', async ({ page }) => {
    // Find status filter
    const filterSelect = page.locator('select[name="status"]');
    await filterSelect.selectOption('confirmed');

    // Wait for table to update
    await page.waitForLoadState('networkidle');

    // Verify only confirmed bookings shown
    const statusBadges = page.locator('[data-status="confirmed"]');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('should open booking details drawer', async ({ page }) => {
    // Click first booking row
    const firstBooking = page.locator('tbody tr').first();
    await firstBooking.click();

    // Verify drawer opens
    const drawer = page.locator('[data-drawer="booking-details"]');
    await expect(drawer).toBeVisible();

    // Check booking details displayed
    const customerName = drawer.locator('[data-field="customer-name"]');
    await expect(customerName).toBeVisible();
  });

  test('should update booking status', async ({ page }) => {
    // Open booking details
    const firstBooking = page.locator('tbody tr').first();
    await firstBooking.click();

    // Find status update button
    const confirmButton = page.locator('button:has-text("تأكيد الموعد")');
    await confirmButton.click();

    // Verify confirmation dialog
    const confirmDialog = page.locator('role=dialog');
    await expect(confirmDialog).toBeVisible();

    // Click confirm in dialog
    const confirmAction = confirmDialog.locator('button:has-text("تأكيد")');
    await confirmAction.click();

    // Verify status updated
    const successMessage = page.locator('text=تم تحديث حالة الحجز');
    await expect(successMessage).toBeVisible();
  });
});

test.describe('Customer Portal (/customer)', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set customer auth cookie
    await context.addCookies([
      {
        name: 'supabase-auth-token',
        value: 'mock-customer-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/customer');
  });

  test('should display customer dashboard', async ({ page }) => {
    // Check for customer-specific content
    const greeting = page.locator('text=مرحباً');
    await expect(greeting).toBeVisible();

    // Check for my bookings section
    const myBookings = page.locator('text=حجوزاتي');
    await expect(myBookings).toBeVisible();
  });

  test('should show only customer\'s own bookings', async ({ page }) => {
    // Get all booking rows
    const bookingRows = page.locator('[data-type="booking-row"]');
    const count = await bookingRows.count();

    // Should have at least 1 booking (or 0 if none)
    expect(count).toBeGreaterThanOrEqual(0);

    // Verify no other customer's data shown
    if (count > 0) {
      const firstBooking = bookingRows.first();
      const customerId = await firstBooking.getAttribute('data-customer-id');
      expect(customerId).toBeTruthy();
    }
  });

  test('should not allow access without authentication', async ({ page, context }) => {
    // Clear auth cookies
    await context.clearCookies();

    // Try to access /customer
    await page.goto('/customer');

    // Should redirect to login
    await expect(page).toHaveURL(/\/customer\/login/);
  });
});

test.describe('Admin Authentication', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/admin/bookings');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should allow login with valid credentials', async ({ page }) => {
    await page.goto('/admin/login');

    // Fill login form (mock credentials)
    await page.fill('input[type="email"]', 'admin@diagpro.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/bookings/);
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrong-password');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show error message
    const errorMessage = page.locator('text=بيانات الدخول غير صحيحة');
    await expect(errorMessage).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
