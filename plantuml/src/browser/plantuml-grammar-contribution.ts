/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { LanguageGrammarDefinitionContribution, TextmateRegistry } from "@theia/monaco/lib/browser/textmate";
import { injectable } from "inversify";

export const PLANTUML_LANGUAGE_ID = 'plantuml';
export const PLANTUML_LANGUAGE_NAME = 'PlantUML';

@injectable()
export class PlantumlGrammarContribution implements LanguageGrammarDefinitionContribution {
    readonly scopeName = 'source.wsd';

    readonly config: monaco.languages.LanguageConfiguration = {
        comments: {
            lineComment: "'",
            blockComment: ["/'", "'/"]
        },

        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],

        autoClosingPairs: [
            { open: '"', close: '"', notIn: ['string', 'comment'] },
            { open: '{', close: '}', notIn: ['string', 'comment'] },
            { open: '[', close: ']', notIn: ['string', 'comment'] },
            { open: '(', close: ')', notIn: ['string', 'comment'] }
        ]
    };

    registerTextmateLanguage(registry: TextmateRegistry) {
        monaco.languages.register({
            id: PLANTUML_LANGUAGE_ID,
            "aliases": [
                "PlantUML",
                "plantuml"
            ],
            "extensions": [
                ".plantuml",
                ".pu",
                ".puml",
                ".uml"
            ],
            "mimetypes": [
                "text/plantuml"
            ]
        });

        monaco.languages.setLanguageConfiguration(PLANTUML_LANGUAGE_ID, this.config);

        const plantumlGrammar = require('../../data/plantuml.tmLanguage.json');
        registry.registerTextmateGrammarScope(this.scopeName, {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: plantumlGrammar
                };
            }
        });

        registry.mapLanguageIdToTextmateGrammar(PLANTUML_LANGUAGE_ID, this.scopeName);

    }
}