import {
  App,
  Modal,
  Notice,
  Plugin,
  TFile,
  ButtonComponent,
} from "obsidian";

export default class EmptyFilesCleaner extends Plugin {
  async onload() {
    this.addRibbonIcon("trash-2", "Find empty files", () => {
      new EmptyFilesModal(this.app).open();
    });

    this.addCommand({
      id: "find-empty-files",
      name: "Find and delete empty files",
      callback: () => {
        new EmptyFilesModal(this.app).open();
      },
    });
  }
}

class EmptyFilesModal extends Modal {
  private emptyFiles: TFile[] = [];
  private checkedFiles: Set<string> = new Set();
  private listContainer: HTMLElement;

  constructor(app: App) {
    super(app);
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("empty-files-modal");

    // Header
    const header = contentEl.createEl("div", { cls: "ef-header" });
    header.createEl("h2", { text: "🗑️ Empty Files Cleaner" });
    header.createEl("p", {
      text: "Scanning your vault for empty notes...",
      cls: "ef-subtitle",
    });

    // Scanning indicator
    const scanningEl = contentEl.createEl("div", {
      cls: "ef-scanning",
      text: "⏳ Scanning...",
    });

    await this.scanEmptyFiles();

    scanningEl.remove();

    if (this.emptyFiles.length === 0) {
      contentEl.createEl("div", {
        cls: "ef-empty-state",
        text: "✅ No empty files found! Your vault is clean.",
      });
      new ButtonComponent(contentEl)
        .setButtonText("Close")
        .setCta()
        .onClick(() => this.close());
      return;
    }

    // Stats bar
    const statsBar = contentEl.createEl("div", { cls: "ef-stats" });
    const countEl = statsBar.createEl("span", {
      cls: "ef-count",
      text: `Found ${this.emptyFiles.length} empty file${
        this.emptyFiles.length !== 1 ? "s" : ""
      }`,
    });

    // Select all controls
    const controls = contentEl.createEl("div", { cls: "ef-controls" });

    const selectAllBtn = controls.createEl("button", {
      cls: "ef-btn ef-btn-secondary",
      text: "Select all",
    });
    const deselectAllBtn = controls.createEl("button", {
      cls: "ef-btn ef-btn-secondary",
      text: "Deselect all",
    });

    selectAllBtn.addEventListener("click", () => {
      this.emptyFiles.forEach((f) => this.checkedFiles.add(f.path));
      this.updateCheckboxes();
      this.updateDeleteButton();
    });

    deselectAllBtn.addEventListener("click", () => {
      this.checkedFiles.clear();
      this.updateCheckboxes();
      this.updateDeleteButton();
    });

    // File list
    this.listContainer = contentEl.createEl("div", { cls: "ef-list" });
    this.renderFileList();

    // Footer with delete button
    const footer = contentEl.createEl("div", { cls: "ef-footer" });

    const deleteBtn = footer.createEl("button", {
      cls: "ef-btn ef-btn-danger",
      attr: { id: "ef-delete-btn", disabled: "true" },
      text: "Delete selected (0)",
    });

    const cancelBtn = footer.createEl("button", {
      cls: "ef-btn ef-btn-ghost",
      text: "Cancel",
    });

    cancelBtn.addEventListener("click", () => this.close());

    deleteBtn.addEventListener("click", async () => {
      if (this.checkedFiles.size === 0) return;
      await this.deleteSelected(deleteBtn, countEl);
    });
  }

  private async scanEmptyFiles() {
    const files = this.app.vault.getMarkdownFiles();
    this.emptyFiles = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      if (content.trim() === "") {
        this.emptyFiles.push(file);
      }
    }

    // Sort by path
    this.emptyFiles.sort((a, b) => a.path.localeCompare(b.path));
  }

  private renderFileList() {
    this.listContainer.empty();

    for (const file of this.emptyFiles) {
      const item = this.listContainer.createEl("div", { cls: "ef-item" });

      const checkbox = item.createEl("input", {
        type: "checkbox",
        cls: "ef-checkbox",
        attr: { "data-path": file.path },
      }) as HTMLInputElement;

      checkbox.checked = this.checkedFiles.has(file.path);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          this.checkedFiles.add(file.path);
        } else {
          this.checkedFiles.delete(file.path);
        }
        this.updateDeleteButton();
      });

      const info = item.createEl("div", { cls: "ef-item-info" });
      info.createEl("span", { cls: "ef-item-name", text: file.basename });
      info.createEl("span", { cls: "ef-item-path", text: file.path });

      item.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).tagName !== "INPUT") {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change"));
        }
      });
    }
  }

  private updateCheckboxes() {
    const checkboxes =
      this.listContainer.querySelectorAll<HTMLInputElement>(".ef-checkbox");
    checkboxes.forEach((cb) => {
      cb.checked = this.checkedFiles.has(cb.dataset.path || "");
    });
  }

  private updateDeleteButton() {
    const btn = document.getElementById("ef-delete-btn") as HTMLButtonElement;
    if (!btn) return;
    const count = this.checkedFiles.size;
    btn.textContent = `Delete selected (${count})`;
    btn.disabled = count === 0;
    btn.toggleClass("ef-btn-danger--active", count > 0);
  }

  private async deleteSelected(
    deleteBtn: HTMLButtonElement,
    countEl: HTMLSpanElement
  ) {
    const confirmed = confirm(
      `Are you sure you want to permanently delete ${this.checkedFiles.size} file(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";

    let deleted = 0;
    const errors: string[] = [];

    for (const path of this.checkedFiles) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        try {
          await this.app.vault.delete(file);
          deleted++;
        } catch (e) {
          errors.push(path);
        }
      }
    }

    if (errors.length > 0) {
      new Notice(`⚠️ Could not delete ${errors.length} file(s).`);
    }

    new Notice(`✅ Deleted ${deleted} empty file${deleted !== 1 ? "s" : ""}.`);

    // Refresh the list
    this.checkedFiles.clear();
    await this.scanEmptyFiles();
    this.renderFileList();
    countEl.textContent = `Found ${this.emptyFiles.length} empty file${
      this.emptyFiles.length !== 1 ? "s" : ""
    }`;
    this.updateDeleteButton();

    if (this.emptyFiles.length === 0) {
      this.close();
      new Notice("✅ All selected empty files have been deleted!");
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}
