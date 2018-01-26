/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from 'inversify';
import { PreviewHandler } from '@theia/preview/lib/browser';
import { PlantUmlPreviewHandler } from './plantuml-preview-handler';
import { bindPlantumlPreferences } from './plantuml-preferences';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindPlantumlPreferences(bind);
    bind(PlantUmlPreviewHandler).toSelf().inSingletonScope();
    bind(PreviewHandler).toDynamicValue(ctx => ctx.container.get(PlantUmlPreviewHandler));
});
