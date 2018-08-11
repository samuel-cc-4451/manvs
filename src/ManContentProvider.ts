'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import * as mustache from 'mustache';
import * as fs from 'fs';

export class ManContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private uri = vscode.Uri.parse('manvs://authority/manvs');
    private templatePath = path.join(__dirname, '../resources/template.html');

    private data: string = "";
    private template: string = "";

    constructor() {
        fs.readFile(this.templatePath, (_, data: Buffer) => {
            this.template = data.toString();
        });
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public async update(command: string) {
        let res: any = await this.sh(command)
        this.data = res.stdout;

        this._onDidChange.fire(this.uri);
    }

    public async displayMan(cmd: string | undefined) {
        if (cmd == undefined)
            return;

        cmd = cmd.trim();
        if (cmd == "")
            return;

        await this.update(`man ${cmd} | col -b`);

        return vscode.commands.executeCommand('vscode.previewHtml', vscode.Uri.parse('manvs://authority/manvs'), vscode.ViewColumn.Active, `MAN ${cmd}`).then(_ => { }, _ => {
            vscode.window.showErrorMessage("Can't open man page.");
        });
    }

    public getCursorSelection() {
        var options: vscode.InputBoxOptions = { value: "" };
        const { activeTextEditor } = vscode.window;
        // If there's no activeTextEditor, do nothing.
        if (!activeTextEditor) {
            return options;
        }

        const { document, selection } = activeTextEditor;
        const wordAtCursorRange = document.getWordRangeAtPosition(selection.active);

        // If at this point, we don't have a word range, abort.
        if (wordAtCursorRange === undefined) {
            return options;
        }
        else {
            options.value = document.getText(wordAtCursorRange);
            return options;
        }

    }

    private sh(cmd: string) {
        return new Promise(function (resolve, reject) {
            exec(cmd, (err, stdout: string, stderr: string) => {
                if (err)
                    reject(err);
                else
                    resolve({ stdout, stderr });
            });
        });
    }

    provideTextDocumentContent(_: vscode.Uri): vscode.ProviderResult<string> {
        if (this.template == "" || this.data == "") {
            vscode.window.showErrorMessage("Internal error. Try restarting vs code.");
            return;
        }

        return mustache.render(this.template, { manpage: this.data });
    }
}
