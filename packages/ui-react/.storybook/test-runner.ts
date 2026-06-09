import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import * as process from 'node:process';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Wait for fonts and images to load before snapshotting.
    await page.waitForLoadState('networkidle');

    const storyContext = await getStoryContext(page, context);
    const snapshotFullPage =
      storyContext.parameters?.snapshot?.fullPage === true;

    // Only wait for animations when a story opts in via
    // parameters.snapshot.animationDelay — avoids a blanket wait on every story.
    const animationDelay = storyContext.parameters?.snapshot?.animationDelay;
    if (animationDelay) {
      await page.waitForTimeout(
        typeof animationDelay === 'number' ? animationDelay : 400
      );
    }

    let image: Buffer;
    if (snapshotFullPage) {
      // Some stories are too tall for the default viewport — capture the full
      // page so nothing is clipped.
      image = await page.screenshot({ animations: 'disabled', fullPage: true });
    } else {
      // Floating UI (dialogs, menus, listboxes) renders in a portal outside
      // #storybook-root — snapshot the overlay itself when present.
      const overlay = page
        .locator(
          '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]'
        )
        .first();
      const hasOverlay = (await overlay.count()) > 0;
      const target = hasOverlay ? overlay : page.locator('#storybook-root');
      const box = await target.boundingBox();
      const padding = 24;
      const viewport = page.viewportSize();
      const clip = box && viewport
        ? (() => {
            const x = Math.max(0, box.x - padding);
            const y = Math.max(0, box.y - padding);
            return {
              x,
              y,
              width: Math.min(box.width + padding * 2, viewport.width - x),
              height: Math.min(box.height + padding * 2, viewport.height - y),
            };
          })()
        : undefined;
      image = await page.screenshot({ animations: 'disabled', clip });
    }
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: `${process.cwd()}/test/__snapshots__`,
      customSnapshotIdentifier: context.id,
      failureThreshold: 0.005,
      failureThresholdType: 'percent',
    });
  },
};

export default config;
