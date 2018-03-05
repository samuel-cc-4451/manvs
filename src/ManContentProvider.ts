'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

export class ManContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private uri = vscode.Uri.parse('manvs://authority/manvs');
    private resources = path.join(__dirname, '../resources');

    private data: string = "";

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public async update(command: string) {
        let res: any = await this.sh(command)
        this.data = res.stdout;

        this._onDidChange.fire(this.uri);
    }

    private sh(cmd: string) {
        return new Promise(function (resolve, reject) {
            exec(`man ${cmd}`, (err, stdout: string, stderr: string) => {
                if (err)
                    reject(err);
                else
                    resolve({stdout, stderr});
            });
        });
    }

    provideTextDocumentContent(_: vscode.Uri): vscode.ProviderResult<string> {
        return `<pre>${this.data}</pre>`;
    }
}
