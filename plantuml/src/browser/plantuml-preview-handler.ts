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
        const extension: string = uri.path.ext;
        if ((extension === '.plantuml') || (extension === '.puml') || (extension === '.uml') || (extension === '.pu')) {
            return 500;
        }
        return 0;
    }

    async renderContent(params: RenderContentParams): Promise<HTMLElement | undefined> {
        const contentElement = document.createElement('div');
        contentElement.classList.add(this.contentClass, this.theme);

        const content = this.useMonochromeTheme(params.content);
        const url = this.createRequestUrl(content);
        try {
            const response = await fetch(url);
            const renderedContent = await response.text();
            contentElement.innerHTML = renderedContent;
            this.fixSvg(contentElement);
        } catch (error) {
            console.log(error);
            contentElement.classList.add('error');
            contentElement.innerText = `Failed to load diagram from ${this.webserviceUrl}`;
        }
        return contentElement;
    }

    protected fixSvg(element: HTMLElement): void {
        const candidates = element.getElementsByTagName('svg');
        if (candidates.length > 0) {
            const svgElement = candidates.item(0);
            if (svgElement) {
                svgElement.removeAttribute('zoomAndPan');
                svgElement.setAttribute('style', 'width: 100%; height: 100%;');
                svgElement.setAttribute('preserveAspectRatio', 'xMinYMin meet');
                const viewBoxValue = svgElement.getAttribute('viewBox') || '';
                const width = svgElement.getAttribute('width') || '';
                const height = svgElement.getAttribute('height') || '';
                svgElement.removeAttribute('height');
                svgElement.removeAttribute('width');
                element.addEventListener('dblclick', mouseEvent => {
                    if (svgElement.getAttribute('viewBox')) {
                        svgElement.removeAttribute('viewBox');
                        svgElement.setAttribute('style', `width: ${width}; height: ${height};`);
                    } else {
                        svgElement.setAttribute('viewBox', viewBoxValue);
                        svgElement.setAttribute('style', 'width: 100%; height: 100%;');
                    }
                });
            }
        }
    }

    get webserviceUrl() {
        return `${window.location.protocol}${this.preferences[PLANTUML.WEBSERVICE]}`;
    }

    protected createRequestUrl(content: string): string {
        const encoded = plantumlEncoder.encode(content);
        const serviceUri = new URI(this.webserviceUrl);
        return serviceUri.withPath(serviceUri.path.join(encoded)).toString();
    }

    protected useMonochromeTheme(content: string): string {
        if (!this.preferences[PLANTUML.MONOCHROME]) {
            return content;
        }
        if (content.indexOf('skinparam') > 0) {
            return content;
        }
        const monochrome = this.theme === 'dark' ? 'reverse' : 'true';
        return content.replace('@startuml', `@startuml\nskinparam monochrome ${monochrome}\nskinparam backgroundColor transparent\n`);
    }

}
