import { test, expect } from '@playwright/test'
import { makeFixture } from '../../src/services/fixtures.js'
const conditions = { city: '서울특별시', district: '영등포구', startDate: '2026-10-01', endDate: '2026-10-03' }
async function search(page, scenario = 'mixed') {
  if (scenario !== 'mixed') {
    await page.locator('.demo-settings').evaluate(element => { element.open = true })
    await page.getByLabel('응답 시나리오').selectOption(scenario)
  }
  await page.getByRole('button', { name: '데모 매장 찾기', exact: true }).click()
  await expect(page.getByRole('button', { name: '데모 매장 찾기', exact: true })).toBeEnabled()
  await expect(page.locator('.waiting')).toHaveCount(0)
}
async function theme(page, name) {
  await page.getByRole('button', { name: /화면 테마/ }).click()
  await page.getByRole('radio', { name, exact: false }).check()
  await page.getByRole('button', { name: '적용 완료' }).click()
}
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}
test('complete path, entity joins, conflict evidence, filters, theme state and session boundary', async ({ page }) => {
  const errors = []; const external = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5173')) external.push(request.url()) })
  await page.goto('/')
  await search(page)
  await expect(page.locator('.entity-row')).toHaveCount(3)
  await expect(page.locator('.entity-row', { hasText: '초안 있음' })).toHaveCount(1)
  await page.locator('.entity-row', { hasText: '모퉁이 부엌' }).click()
  await expect(page.locator('#entity-title')).toContainText('모퉁이 부엌')
  await expect(page.locator('.evidence-content')).toContainText(['모퉁이 부엌', '모퉁이 분식'])
  await expect(page.locator('.proposal-preview')).toHaveCount(0)
  await page.getByLabel('시·군·구').fill('강남구')
  await theme(page, '다크')
  await expect(page.getByLabel('시·군·구')).toHaveValue('강남구')
  await expect(page.locator('#entity-title')).toContainText('모퉁이 부엌')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByLabel('매장 필터').selectOption('draft')
  await expect(page.locator('.entity-row')).toHaveCount(1)
  await expect(page.getByText('확인할 매장을 선택하세요')).toBeVisible()
  await page.locator('.entity-row').click()
  await expect(page.locator('#entity-title')).toContainText('온기 식탁')
  await expect(page.locator('.facts-grid > div', { hasText: '인터넷 사용' })).toContainText('없음')
  await expect(page.locator('.facts-grid > div', { hasText: '결합 상품 수' })).toContainText('0')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.entity-row')).toHaveCount(0)
  expect(errors).toEqual([]); expect(external).toEqual([])
})
test('invalid input, distinct empty/confirmation/error/unknown, and no LIVE fallback', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('시·군·구').fill('')
  await page.getByRole('button', { name: '데모 매장 찾기' }).click()
  await expect(page.getByLabel('시·군·구')).toBeFocused()
  await expect(page.getByText('시·군·구를 입력해 주세요.')).toBeVisible()
  await page.getByLabel('시·군·구').fill('영등포구')
  await search(page, 'empty')
  await expect(page.getByText('조건에 맞는 매장이 없어요')).toBeVisible()
  for (const [scenario, text] of [['confirmation', '검색 조건 확인이 필요해요'], ['error', '조회하지 못했어요'], ['invalid', '전체 매장 목록이 응답에 없어요'], ['timeout', '응답 결과 미확인']]) {
    await search(page, scenario); await expect(page.getByRole('alert')).toContainText(text)
  }
  await page.getByLabel('데이터 모드').selectOption('LIVE')
  await page.getByRole('button', { name: '실제 연결 확인' }).click()
  await expect(page.getByRole('alert')).toContainText('데모 결과로 대체하지 않았어요')
  await expect(page.locator('.entity-row')).toHaveCount(0)
})
test('no-match and no-draft branch results never display a proposal', async ({ page }) => {
  await page.goto('/')
  for (const [scenario, message] of [['unmatched', '확인 필요'], ['noCandidate', '상품 후보 없음'], ['noOpportunity', '연결 상품 없음'], ['modelError', '초안 생성 결과의 형식을 확인하지 못했어요'], ['saveError', '초안 저장을 완료하지 못했어요']]) {
    await search(page, scenario)
    await expect(page.locator('.detail-panel')).toContainText(message)
    await expect(page.locator('.proposal-preview')).toHaveCount(0)
  }
})
test('a failed search keeps the previous result and edited conditions until a new success', async ({ page }) => {
  await page.goto('/'); await search(page)
  await page.locator('.entity-row', { hasText: '모퉁이 부엌' }).click()
  await page.getByLabel('시·군·구').fill('강남구')
  await search(page, 'error')
  await expect(page.getByRole('alert')).toContainText('이전에 완료한 검색 결과')
  await expect(page.getByLabel('시·군·구')).toHaveValue('강남구')
  await expect(page.locator('.result-heading')).toContainText('영등포구')
  await expect(page.locator('#entity-title')).toContainText('모퉁이 부엌')
  await expect(page.locator('.entity-row')).toHaveCount(3)
  await search(page, 'normal')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('.entity-row')).toHaveCount(1)
  await expect(page.locator('.result-heading')).toContainText('강남구')
  await expect(page.locator('.detail-panel')).toContainText('강남구')
})
test('waiting suppresses duplicate submits; stop and resubmit cannot accept the old response', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '데모 매장 찾기' }).dblclick()
  await expect(page.locator('.search-submit')).toHaveAttribute('aria-disabled', 'true')
  await page.getByRole('button', { name: '응답 대기 중단' }).click()
  await expect(page.getByRole('alert')).toContainText('서버 실행 취소를 의미하지 않아요')
  await page.getByLabel('시·군·구').fill('강남구')
  await search(page)
  await expect(page.locator('.row-address').first()).toContainText('강남구')
  await expect(page.locator('.row-address').first()).not.toContainText('영등포구')
})
test('keyboard theme dialog traps/restores focus, system follows OS only when selected', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const trigger = page.getByRole('button', { name: /화면 테마/ })
  await trigger.focus(); await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => !!document.activeElement.closest('dialog'))).toBe(true) }
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused()
  await theme(page, '라이트')
  await page.emulateMedia({ colorScheme: 'light' }); await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await theme(page, '시스템'); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByLabel('시·군·구').focus(); await page.keyboard.press('Enter')
  await expect(page.locator('.entity-row')).toHaveCount(3)
  await page.locator('.entity-row').nth(1).focus(); await page.keyboard.press('Enter')
  await expect(page.locator('#entity-title')).toBeFocused()
})
test('storage denial, invalid value, early bootstrap, and cross-tab synchronization', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' })
  const page = await context.newPage()
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('denied') }; Storage.prototype.setItem = () => { throw new Error('denied') } })
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await theme(page, '라이트'); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await context.close()
  const normal = await browser.newContext({ colorScheme: 'dark' })
  const a = await normal.newPage(); await a.goto('/')
  await a.evaluate(() => localStorage.setItem('kt-opportunity.theme.v1', 'invalid')); await a.reload()
  await expect(a.locator('html')).toHaveAttribute('data-theme-preference', 'system')
  await theme(a, '라이트')
  const b = await normal.newPage(); await b.route('**/src/main.jsx', route => route.abort())
  await b.goto('/'); await expect(b.locator('html')).toHaveAttribute('data-theme', 'light')
  await b.unroute('**/src/main.jsx'); await b.reload()
  await b.getByLabel('시·군·구').fill('서초구')
  await theme(a, '다크'); await expect(b.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(b.getByLabel('시·군·구')).toHaveValue('서초구')
  await normal.close()
})
test('untrusted strings render as text and unsafe evidence links never execute', async ({ page }) => {
  const raw = makeFixture('mixed', conditions)
  const attack = '<img src=x onerror="window.__injected=true">'
  raw[0].entities[0].storeProfile.businessName = attack
  raw[0].entities[0].evidenceList[0].normalizedValue.businessName = attack
  raw[0].entities[0].evidenceList[0].sourceUrl = 'javascript:alert(1)'
  await page.route('**/src/services/fixtures.js', route => route.fulfill({ contentType: 'application/javascript', body: `export const SCENARIOS=[['mixed','안전 렌더링 시험']]; export function makeFixture(){return ${JSON.stringify(raw)}}` }))
  await page.goto('/'); await search(page)
  await expect(page.locator('#entity-title')).toHaveText(attack)
  await expect(page.locator('.detail-panel img')).toHaveCount(0)
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0)
  expect(await page.evaluate(() => window.__injected)).toBeUndefined()
})
for (const color of ['light', 'dark']) {
  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`responsive ${color} ${width}: search/list/detail, long text, keyboard return`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 }); await page.emulateMedia({ colorScheme: color })
      await page.goto('/'); await noOverflow(page)
      await page.getByLabel('시작일', { exact: true }).fill('2026-10-01')
      await page.getByLabel('종료일', { exact: false }).fill('2026-10-03')
      if ([390, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath('initial.png'), fullPage: true })
      await search(page); await noOverflow(page)
      if ([390, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath('list.png'), fullPage: true })
      await page.locator('.entity-row').last().click()
      await expect(page.locator('#entity-title')).toContainText('소담한 상차림')
      await noOverflow(page)
      if ([390, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath('detail.png'), fullPage: true })
      if (width < 768) {
        await expect(page.locator('.list-panel')).toBeHidden()
        await page.getByRole('button', { name: '전체 매장 목록으로' }).click()
        await expect(page.locator('.entity-row').last()).toBeFocused()
        await expect(page.locator('.entity-row').last()).toHaveAttribute('aria-pressed', 'true')
      }
    })
  }
}
test('200 percent text zoom, reduced motion, visible touch targets and actual contrast', async ({ page }, testInfo) => {
  const reports = []
  for (const color of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: color, reducedMotion: 'reduce' }); await page.goto('/'); await search(page)
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await noOverflow(page)
    await page.screenshot({ path: testInfo.outputPath(`zoom-${color}.png`), fullPage: true })
    await page.evaluate(() => { document.documentElement.style.fontSize = '' })
    const report = await page.evaluate(() => {
      const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number)
      const luminance = color => rgb(color).map(v => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4 }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0)
      const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05)
      const checks = []
      for (const selector of ['.primary', '.mode-banner', '.entity-row .tag', '.entity-row .muted', '.detail-panel .notice', '.detail-panel .muted', '.detail-panel h2', '.goal-preview p']) {
        for (const el of document.querySelectorAll(selector)) {
          const style = getComputedStyle(el); let parent = el; let bg
          while (parent) { bg = getComputedStyle(parent).backgroundColor; if (!bg.endsWith(', 0)') && bg !== 'transparent') break; parent = parent.parentElement }
          checks.push({ selector, ratio: contrast(style.color, bg), text: el.textContent.slice(0, 25) })
        }
      }
      return { checks, transition: getComputedStyle(document.querySelector('.entity-row')).transitionDuration, targets: [...document.querySelectorAll('button,input,select,summary')].filter(el => el.getClientRects().length && !el.closest('dialog:not([open])')).map(el => ({ name: el.textContent.slice(0,20), height: el.getBoundingClientRect().height })) }
    })
    report.checks.forEach(check => expect(check.ratio, `${color} ${check.selector} ${check.text}`).toBeGreaterThanOrEqual(4.5))
    report.targets.forEach(target => expect(target.height, target.name).toBeGreaterThanOrEqual(44))
    expect(report.transition).toBe('0s'); reports.push({ color, ...report })
  }
  await testInfo.attach('contrast-and-targets', { body: JSON.stringify(reports, null, 2), contentType: 'application/json' })
})
for (const color of ['light', 'dark']) {
  test(`mobile enlarged text ${color}: session notice, search, detail and theme remain usable`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: color, reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByText('새로고침하면 검색 결과가 초기화돼요.')).toBeVisible()
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await noOverflow(page)
    await search(page)
    await noOverflow(page)
    await page.locator('.entity-row').last().click()
    await expect(page.locator('#entity-title')).toContainText('소담한 상차림')
    await noOverflow(page)
    await page.getByRole('button', { name: /화면 테마/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.getByRole('radio', { name: '시스템', exact: false }).check()
    await page.getByRole('button', { name: '적용 완료' }).click()
    await expect(page.locator('#entity-title')).toContainText('소담한 상차림')
    await page.screenshot({ path: testInfo.outputPath('mobile-enlarged-detail.png'), fullPage: true })
    await page.getByRole('button', { name: '전체 매장 목록으로' }).click()
    await expect(page.locator('.entity-row').last()).toBeFocused()
  })
  test(`control states ${color}: boundaries, focus, invalid input and dialog`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: color, reducedMotion: 'reduce' }); await page.goto('/')
    await page.getByLabel('시·군·구').fill('')
    await page.getByRole('button', { name: '데모 매장 찾기' }).click()
    const checkContrast = async () => page.evaluate(() => {
      const lum = value => value.match(/[\d.]+/g).slice(0,3).map(Number).map(v => { const c=v/255; return c<=.04045?c/12.92:((c+.055)/1.055)**2.4 }).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
      const ratio = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05)
      const bg = el => { let item=el; while(item) { const c=getComputedStyle(item).backgroundColor; if(c!=='transparent' && !c.endsWith(', 0)')) return c; item=item.parentElement } }
      return [...document.querySelectorAll('input:not([type="radio"]),select,button.primary,button.secondary,.field-error,dialog[open] label,dialog[open] p,dialog[open] h2')].filter(el=>el.getClientRects().length).flatMap(el=> {
        const s=getComputedStyle(el), rows=[{ name:el.tagName, type:'text', ratio:ratio(s.color,bg(el)), min:4.5 }]
        if(['INPUT','SELECT','BUTTON'].includes(el.tagName)) rows.push({name:el.tagName,type:'control',ratio:ratio(s.borderTopColor,bg(el.parentElement)),min:3})
        if(el.matches(':focus-visible')) rows.push({name:el.tagName,type:'focus',ratio:ratio(s.outlineColor,bg(el.parentElement)),min:3})
        return rows
      })
    })
    const checks = await checkContrast()
    await page.getByRole('button', { name: /화면 테마/ }).click()
    checks.push(...await checkContrast())
    await page.screenshot({ path: testInfo.outputPath('theme-dialog.png') })
    checks.forEach(check=>expect(check.ratio,`${color} ${check.name} ${check.type}`).toBeGreaterThanOrEqual(check.min))
    await page.keyboard.press('Escape'); await page.getByLabel('시·군·구').fill('영등포구')
    await page.getByLabel('시작일', { exact:true }).fill('2026-10-01'); await page.getByLabel('종료일').fill('2026-10-03')
    await search(page)
    await page.locator('#result-heading').scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('workspace-preview.png') })
    await testInfo.attach('control-contrast', { body: JSON.stringify(checks, null, 2), contentType: 'application/json' })
  })
}
