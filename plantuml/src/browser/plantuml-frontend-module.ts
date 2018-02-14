/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from 'inversify';
import { PreviewHandler } from '@theia/preview/lib/browser';
import { PreferenceContribution } from '@theia/core/lib/browser/preferences';
import { PlantUmlPreviewHandler } from './plantuml-preview-handler';
import { bindPlantumlPreferences, PlantumlConfigSchema } from './plantuml-preferences';
import { registerPlantUml } from './plantuml-language-config';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    registerPlantUml();
    bindPlantumlPreferences(bind);
    bind(PreferenceContribution).toConstantValue({ schema: PlantumlConfigSchema });

    bind(PlantUmlPreviewHandler).toSelf().inSingletonScope();
    bind(PreviewHandler).toDynamicValue(ctx => ctx.container.get(PlantUmlPreviewHandler));
});
