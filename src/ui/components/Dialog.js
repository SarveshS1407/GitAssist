/**
 * Dialog / Modal Component
 * Reusable modal overlay for prompts (e.g. Open Repository path)
 */
export class Dialog {
  constructor({ title, content, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
    this.title = title;
    this.content = content; // HTMLElement or HTML string
    this.confirmText = confirmText;
    this.cancelText = cancelText;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.overlay = null;
  }

  open() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-backdrop';

    const dialogBox = document.createElement('div');
    dialogBox.className = 'modal-box';

    dialogBox.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${this.title}</h3>
        <button class="modal-close-btn" id="modal-close">✕</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modal-cancel">${this.cancelText}</button>
        <button class="btn-primary" id="modal-confirm">${this.confirmText}</button>
      </div>
    `;

    const bodyEl = dialogBox.querySelector('#modal-body');
    if (typeof this.content === 'string') {
      bodyEl.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      bodyEl.appendChild(this.content);
    }

    dialogBox.querySelector('#modal-close').addEventListener('click', () => this.close());
    dialogBox.querySelector('#modal-cancel').addEventListener('click', () => {
      if (this.onCancel) this.onCancel();
      this.close();
    });

    dialogBox.querySelector('#modal-confirm').addEventListener('click', () => {
      if (this.onConfirm) this.onConfirm(this.overlay);
      this.close();
    });

    this.overlay.appendChild(dialogBox);
    document.body.appendChild(this.overlay);
  }

  close() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }
}
