'use strict';
import * as vscode from 'vscode';
import { ManContentProvider } from './ManContentProvider';

export async function activate(context: vscode.ExtensionContext) {
    let provider = new ManContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider("manvs", provider);

    let manPage = vscode.commands.registerCommand('manvs.man', async () => {
        let cmd = await vscode.window.showInputBox(provider.getCursorSelection());
        provider.displayMan(cmd);
    });

    context.subscriptions.push(registration, manPage);
}

export function deactivate() {
}
