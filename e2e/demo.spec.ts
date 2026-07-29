import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator } from '@playwright/test'

async function silenceHeadlessFirefox(
  browserName: string,
  audio: Locator,
): Promise<void> {
  if (browserName !== 'firefox' || !process.env.CI) return
  await audio.evaluate((element) => {
    (element as HTMLAudioElement).muted = true
  })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Vue Audio Native/)
})

test('plays generated audio with keyboard and pointer accessible controls', async ({
  browserName,
  page,
}) => {
  const player = page.locator('.audio-native').first()
  await expect(player).toHaveAttribute('data-state', /ready|paused/)
  await expect(page.getByRole('slider', { name: 'Audio progress' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Download audio' }).first()).toHaveAttribute(
    'href',
    /neon-room\.wav$/,
  )

  await silenceHeadlessFirefox(browserName, player.locator('audio'))
  await page.getByRole('button', { name: 'Play audio' }).first().click()
  await expect(player).toHaveAttribute('data-state', 'playing')
  await expect(page.getByRole('button', { name: 'Pause audio' }).first()).toBeVisible()

  const progress = page.getByRole('slider', { name: 'Audio progress' }).first()
  await progress.focus()
  await progress.press('ArrowRight')
  await page.getByRole('button', { name: 'Pause audio' }).first().press('Space')
  await expect(player).toHaveAttribute('data-state', 'paused')
})

test('keeps tabs keyboard operable and supports reduced motion', async ({ page }) => {
  const recommended = page.getByRole('tab', { name: 'Recommended API' })
  await recommended.focus()
  await recommended.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Legacy Vue API' })).toHaveAttribute(
    'aria-selected',
    'true',
  )

  await page.getByRole('checkbox', { name: /减少动画|Reduce motion/ }).check()
  await expect(page.locator('html')).toHaveClass(/reduce-motion/)
})

test('keeps settings focus inside the Sheet or Drawer and restores it on close', async ({
  page,
}, testInfo) => {
  const isMobile = testInfo.project.name === 'iphone-13' || testInfo.project.name === 'pixel-7'
  const trigger = isMobile
    ? page.getByRole('button', { name: 'Open demo settings' })
    : page.getByRole('button', { name: '演示设置' })

  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: '演示设置' })).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))),
    )
    .toBe(true)

  const nativeControls = dialog.getByRole('switch', { name: 'Toggle native controls' })
  await nativeControls.click()
  await expect(nativeControls).toBeChecked()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.locator('.audio-native').first().locator('audio')).toHaveAttribute('controls', '')
})

test('coordinates exclusive players in the same group', async ({ browserName, page }) => {
  const groupedPlayers = page
    .locator('section')
    .filter({ hasText: '多实例互斥播放' })
    .locator('.audio-native')
  await expect(groupedPlayers).toHaveCount(2)

  await silenceHeadlessFirefox(browserName, groupedPlayers.nth(0).locator('audio'))
  await silenceHeadlessFirefox(browserName, groupedPlayers.nth(1).locator('audio'))
  await groupedPlayers.nth(0).getByRole('button', { name: 'Play audio' }).click()
  await expect(groupedPlayers.nth(0)).toHaveAttribute('data-state', 'playing')
  await groupedPlayers.nth(1).getByRole('button', { name: 'Play audio' }).click()
  await expect(groupedPlayers.nth(0)).toHaveAttribute('data-state', 'paused')
  await expect(groupedPlayers.nth(1)).toHaveAttribute('data-state', 'playing')
})

test('has no horizontal overflow or serious accessibility violations', async ({ page }) => {
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth)

  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter((violation) =>
    violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(blocking).toEqual([])
})
