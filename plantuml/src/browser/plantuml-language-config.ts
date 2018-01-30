/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { getAllPlantumlKeywords } from './plantuml-keywords';

const editorConfiguration: monaco.languages.LanguageConfiguration = {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

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

const languageDefinition: any = {
    tokenPostfix: '.plantuml',
    defaultToken: 'invalid',

    keywords: getAllPlantumlKeywords(),

    operators: [
        'as'
    ],

    symbols: /[xo]?([\[\]\\\}\{\#=><!~?&|+\-*\^]|\/[^']|(\.){2,})+[xo]?/,

    tokenizer: {
        root: [

            // descriptions after `:`
            [/:(.*)$/, 'identifier'],

            // operators
            [/@symbols/, {
                cases: {
                    // meant to highlight stuff like `typeof`, `as`, etc.
                    '@operators': 'keyword.operator',
                    '@default': 'operator'
                }
            }],

            // identifiers and keywords
            [/@[a-zA-Z]+/, {
                cases: {
                    '@keywords': 'keyword'
                }
            }],
            [/[a-zA-Z_][a-zA-Z_0-9]*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'identifier'
                }
            }],

            // whitespace
            { include: '@whitespace' },

            [/[{}()\[\]]/, '@brackets'],
            [/[;:,]/, 'delimiter'],

            // numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        ],

        comment: [
            [/[^\/']+/, 'comment'],
            [/'\//, 'comment', '@pop'],
            [/[\/']/, 'comment']
        ],

        string: [
            [/[^\\"&]+/, 'string'],
            [/\\"/, 'string.escape'],
            [/&\w+;/, 'string.escape'],
            [/[\\&]/, 'string'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/'/, 'comment', '@comment'],
            [/'.*$/, 'comment'],
            [/#.$/, 'comment'],
        ],
    }
};

export function registerPlantUml() {
    monaco.languages.register({
        id: 'plantuml',
        extensions: ['.plantuml', '.puml', '.pu'],
        aliases: ['plantuml'],
        mimetypes: ['text/plantuml']
    });
    monaco.languages.onLanguage('plantuml', () => {
        monaco.languages.setLanguageConfiguration('plantuml', editorConfiguration);
        monaco.languages.setMonarchTokensProvider('plantuml', languageDefinition);
    });
}
