/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from 'inversify';
import { PreviewHandler, RenderContentParams } from '@theia/preview/lib/browser';
import URI from "@theia/core/lib/common/uri";
import { PlantumlPreferences, PLANTUML } from './plantuml-preferences';

const plantumlEncoder = require('plantuml-encoder');

import { ThemeService } from '@theia/core/lib/browser/theming';

@injectable()
export class PlantUmlPreviewHandler implements PreviewHandler {

    readonly contentClass: string = 'plantuml-preview';

    protected theme: string;

    constructor(
        @inject(PlantumlPreferences) protected readonly preferences: PlantumlPreferences
    ) {
        this.theme = ThemeService.get().getCurrentTheme().id;
        ThemeService.get().onThemeChange(event => this.theme = event.newTheme.id);
    }

    canHandle(uri: URI): number {
        return uri.path.ext === '.plantuml' ? 500 : 0;
    }

    async renderContent(params: RenderContentParams): Promise<HTMLElement | undefined> {
        const content = this.addSkin(params.content);
        const url = this.createRequestUrl(content);
        const response = await fetch(url);
        const renderedContent = await response.text();
        const contentElement = document.createElement('div');
        contentElement.classList.add(this.contentClass, this.theme);
        contentElement.innerHTML = renderedContent;
        const candidates = contentElement.getElementsByTagName('svg');
        if (candidates.length > 0) {
            const svg = candidates.item(0);
            if (svg) {
                svg.attributes.removeNamedItem('zoomAndPan');
                svg.attributes.removeNamedItem('viewBox');
                svg.attributes.removeNamedItem('preserveAspectRatio');
            }
        }
        return contentElement;
    }

    protected createRequestUrl(content: string): string {
        const encoded = plantumlEncoder.encode(content);
        const serviceUri = new URI(this.preferences[PLANTUML.WEBSERVICE]);
        return serviceUri.withPath(serviceUri.path.join(encoded)).toString();
    }

    protected addSkin(content: string) {
        if (content.indexOf('skinparam') > 0) {
            return content;
        }
        const monochrome = this.theme === 'dark' ? 'reverse' : 'true';
        return content.replace('@startuml', `@startuml\nskinparam monochrome ${monochrome}\n`);
    }

}
