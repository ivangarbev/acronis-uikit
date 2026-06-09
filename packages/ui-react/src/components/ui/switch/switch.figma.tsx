// Figma Code Connect — status: NEEDS_FIGMA_URL
// Props are mapped to the code component; the Figma node URL below is a
// placeholder. See context/figma-code-connect.md for how to complete it.
import figma from '@figma/code-connect';

import { Switch } from './switch';

figma.connect(
  Switch,
  'https://www.figma.com/design/lrU3ydIyvPYQNE6ixdsKtJ/shadcn-uikit?node-id=1838-1908',
  {
    example: () => <Switch />,
  }
);
