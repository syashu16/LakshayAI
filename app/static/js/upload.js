// Enhanced File Upload JavaScript for LakshyaAI
class FileUploadManager {
  constructor() {
    this.uploads = new Map();
    this.supportedTypes = {
      resume: [".pdf", ".doc", ".docx"],
      document: [".pdf", ".doc", ".docx", ".txt"],
      image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      video: [".mp4", ".webm", ".ogg"],
      audio: [".mp3", ".wav", ".ogg"],
    };
    this.maxFileSizes = {
      resume: 10 * 1024 * 1024, // 10MB
      document: 25 * 1024 * 1024, // 25MB
      image: 5 * 1024 * 1024, // 5MB
      video: 100 * 1024 * 1024, // 100MB
      audio: 50 * 1024 * 1024, // 50MB
    };
    this.init();
  }

  init() {
    this.setupDropZones();
    this.setupFileInputs();
    this.setupProgressTracking();
    this.bindEvents();
    console.log("📁 File Upload Manager initialized");
  }

  setupDropZones() {
    const dropZones = document.querySelectorAll(".drop-zone");

    dropZones.forEach((zone) => {
      // Visual feedback for drag operations
      zone.addEventListener("dragenter", (e) => this.handleDragEnter(e, zone));
      zone.addEventListener("dragover", (e) => this.handleDragOver(e, zone));
      zone.addEventListener("dragleave", (e) => this.handleDragLeave(e, zone));
      zone.addEventListener("drop", (e) => this.handleDrop(e, zone));

      // Click to select files
      zone.addEventListener("click", () => {
        const fileInput =
          zone.querySelector('input[type="file"]') ||
          zone.closest(".upload-container").querySelector('input[type="file"]');
        if (fileInput) fileInput.click();
      });
    });
  }

  setupFileInputs() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach((input) => {
      input.addEventListener("change", (e) => this.handleFileSelect(e));
    });
  }

  setupProgressTracking() {
    // Create progress container if it doesn't exist
    if (!document.getElementById("upload-progress-container")) {
      const container = document.createElement("div");
      container.id = "upload-progress-container";
      container.className = "fixed bottom-4 right-4 z-50 space-y-2 max-w-sm";
      document.body.appendChild(container);
    }
  }

  bindEvents() {
    // Prevent default drag behaviors on the entire document
    document.addEventListener("dragenter", (e) => e.preventDefault());
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());

    // Global paste event for file uploads
    document.addEventListener("paste", (e) => this.handlePaste(e));

    // Cancel upload buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("cancel-upload")) {
        this.cancelUpload(e.target.dataset.uploadId);
      }
    });

    // Retry upload buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("retry-upload")) {
        this.retryUpload(e.target.dataset.uploadId);
      }
    });

    // Remove completed uploads
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-upload")) {
        this.removeUpload(e.target.dataset.uploadId);
      }
    });
  }

  handleDragEnter(e, zone) {
    e.preventDefault();
    zone.classList.add("drag-over");
    this.showDropMessage(zone, "Drop files here");
  }

  handleDragOver(e, zone) {
    e.preventDefault();
    zone.classList.add("drag-over");
  }

  handleDragLeave(e, zone) {
    // Only remove drag-over if we're actually leaving the drop zone
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove("drag-over");
      this.hideDropMessage(zone);
    }
  }

  handleDrop(e, zone) {
    e.preventDefault();
    zone.classList.remove("drag-over");
    this.hideDropMessage(zone);

    const files = Array.from(e.dataTransfer.files);
    const uploadType = zone.dataset.uploadType || "document";

    this.processFiles(files, uploadType, zone);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    const uploadType = e.target.dataset.uploadType || "document";
    const container = e.target.closest(".upload-container");

    this.processFiles(files, uploadType, container);
  }

  handlePaste(e) {
    const items = Array.from(e.clipboardData.items);
    const files = items
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file) => file !== null);

    if (files.length > 0) {
      // Find the active upload zone or use default
      const activeZone =
        document.querySelector(".drop-zone.active") ||
        document.querySelector('.drop-zone[data-upload-type="image"]');

      if (activeZone) {
        const uploadType = activeZone.dataset.uploadType || "image";
        this.processFiles(files, uploadType, activeZone);
      }
    }
  }

  async processFiles(files, uploadType, container) {
    for (const file of files) {
      const validation = this.validateFile(file, uploadType);

      if (!validation.valid) {
        this.showError(validation.error, container);
        continue;
      }

      const uploadId = this.generateUploadId();
      const upload = {
        id: uploadId,
        file: file,
        type: uploadType,
        container: container,
        progress: 0,
        status: "pending",
        xhr: null,
        startTime: Date.now(),
      };

      this.uploads.set(uploadId, upload);
      this.createProgressCard(upload);

      // Start upload with a small delay for better UX
      setTimeout(() => this.startUpload(upload), 100);
    }
  }

  validateFile(file, uploadType) {
    // Check file type
    const allowedTypes =
      this.supportedTypes[uploadType] || this.supportedTypes.document;
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type ${fileExtension} is not supported. Allowed types: ${allowedTypes.join(
          ", "
        )}`,
      };
    }

    // Check file size
    const maxSize = this.maxFileSizes[uploadType] || this.maxFileSizes.document;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${this.formatFileSize(
          file.size
        )}) exceeds the maximum limit of ${this.formatFileSize(maxSize)}`,
      };
    }

    // Check for malicious file patterns (basic security)
    const suspiciousPatterns = [".exe.", ".scr.", ".bat.", ".cmd.", ".com."];
    if (
      suspiciousPatterns.some((pattern) =>
        file.name.toLowerCase().includes(pattern)
      )
    ) {
      return {
        valid: false,
        error: "File appears to be potentially unsafe and cannot be uploaded",
      };
    }

    return { valid: true };
  }

  async startUpload(upload) {
    try {
      upload.status = "uploading";
      this.updateProgressCard(upload);

      const formData = new FormData();
      formData.append("file", upload.file);
      formData.append("upload_type", upload.type);
      formData.append("upload_id", upload.id);

      const xhr = new XMLHttpRequest();
      upload.xhr = xhr;

      // Progress tracking
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          upload.progress = Math.round((e.loaded / e.total) * 100);
          this.updateProgressCard(upload);
        }
      });

      // Success handler
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            upload.status = "completed";
            upload.response = response;
            upload.progress = 100;
            this.updateProgressCard(upload);
            this.handleUploadSuccess(upload, response);
          } catch (error) {
            this.handleUploadError(upload, "Invalid server response");
          }
        } else {
          this.handleUploadError(upload, `Server error: ${xhr.status}`);
        }
      });

      // Error handler
      xhr.addEventListener("error", () => {
        this.handleUploadError(upload, "Network error occurred");
      });

      // Abort handler
      xhr.addEventListener("abort", () => {
        upload.status = "cancelled";
        this.updateProgressCard(upload);
      });

      // Send the request
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error) {
      this.handleUploadError(upload, error.message);
    }
  }

  handleUploadSuccess(upload, response) {
    // Show success message
    this.showSuccess(
      `${upload.file.name} uploaded successfully!`,
      upload.container
    );

    // Trigger custom events
    const event = new CustomEvent("fileUploaded", {
      detail: {
        upload: upload,
        response: response,
      },
    });
    document.dispatchEvent(event);

    // Handle specific upload types
    switch (upload.type) {
      case "resume":
        this.handleResumeUpload(upload, response);
        break;
      case "image":
        this.handleImageUpload(upload, response);
        break;
      default:
        this.handleGenericUpload(upload, response);
    }

    // Auto-remove completed uploads after delay
    setTimeout(() => {
      this.removeUpload(upload.id);
    }, 5000);
  }

  handleResumeUpload(upload, response) {
    // Update resume preview if exists
    const previewContainer = document.getElementById("resume-preview");
    if (previewContainer && response.preview_url) {
      previewContainer.innerHTML = `
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex items-center space-x-3 mb-3">
                        <i class="fas fa-file-pdf text-red-500 text-2xl"></i>
                        <div>
                            <div class="font-medium">${upload.file.name}</div>
                            <div class="text-sm text-gray-500">${this.formatFileSize(
                              upload.file.size
                            )}</div>
                        </div>
                    </div>
                    ${
                      response.analysis
                        ? `
                        <div class="border-t pt-3">
                            <div class="text-sm font-medium text-gray-700 mb-2">AI Analysis</div>
                            <div class="text-sm text-gray-600">${response.analysis.summary}</div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
    }

    // Trigger resume analysis if available
    if (response.file_id) {
      this.triggerResumeAnalysis(response.file_id);
    }
  }

  handleImageUpload(upload, response) {
    // Update image preview
    const previewContainer = upload.container.querySelector(".image-preview");
    if (previewContainer && response.url) {
      previewContainer.innerHTML = `
                <img src="${response.url}" 
                     alt="${upload.file.name}" 
                     class="max-w-full h-auto rounded-lg shadow-sm">
            `;
    }
  }

  handleGenericUpload(upload, response) {
    // Add to file list if container exists
    const fileList = upload.container.querySelector(".file-list");
    if (fileList) {
      const fileItem = document.createElement("div");
      fileItem.className =
        "flex items-center justify-between p-3 bg-gray-50 rounded-lg";
      fileItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="${this.getFileIcon(
                      upload.file.name
                    )} text-gray-600"></i>
                    <div>
                        <div class="font-medium text-sm">${
                          upload.file.name
                        }</div>
                        <div class="text-xs text-gray-500">${this.formatFileSize(
                          upload.file.size
                        )}</div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    ${
                      response.url
                        ? `
                        <a href="${response.url}" 
                           target="_blank" 
                           class="text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    `
                        : ""
                    }
                    <button class="text-red-600 hover:text-red-800 text-sm" 
                            onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
      fileList.appendChild(fileItem);
    }
  }

  handleUploadError(upload, error) {
    upload.status = "error";
    upload.error = error;
    this.updateProgressCard(upload);
    this.showError(
      `Failed to upload ${upload.file.name}: ${error}`,
      upload.container
    );
  }

  createProgressCard(upload) {
    const container = document.getElementById("upload-progress-container");
    if (!container) return;

    const card = document.createElement("div");
    card.id = `upload-${upload.id}`;
    card.className =
      "bg-white border border-gray-200 rounded-lg shadow-sm p-4 transform translate-x-full transition-transform duration-300";

    card.innerHTML = this.getProgressCardHTML(upload);
    container.appendChild(card);

    // Animate in
    setTimeout(() => card.classList.remove("translate-x-full"), 100);
  }

  updateProgressCard(upload) {
    const card = document.getElementById(`upload-${upload.id}`);
    if (!card) return;

    card.innerHTML = this.getProgressCardHTML(upload);
  }

  getProgressCardHTML(upload) {
    const statusIcons = {
      pending: "fas fa-clock text-yellow-500",
      uploading: "fas fa-upload text-blue-500",
      completed: "fas fa-check-circle text-green-500",
      error: "fas fa-exclamation-circle text-red-500",
      cancelled: "fas fa-times-circle text-gray-500",
    };

    const statusColors = {
      pending: "bg-yellow-100 border-yellow-200",
      uploading: "bg-blue-100 border-blue-200",
      completed: "bg-green-100 border-green-200",
      error: "bg-red-100 border-red-200",
      cancelled: "bg-gray-100 border-gray-200",
    };

    return `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                  statusColors[upload.status]
                }">
                    <i class="${statusIcons[upload.status]} text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">${
                      upload.file.name
                    }</div>
                    <div class="text-xs text-gray-500">${this.formatFileSize(
                      upload.file.size
                    )}</div>
                    
                    ${
                      upload.status === "uploading"
                        ? `
                        <div class="mt-2">
                            <div class="flex items-center justify-between text-xs">
                                <span>${upload.progress}%</span>
                                <span>${this.getUploadSpeed(upload)}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                     style="width: ${upload.progress}%"></div>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      upload.status === "error"
                        ? `
                        <div class="text-xs text-red-600 mt-1">${upload.error}</div>
                    `
                        : ""
                    }
                </div>
                
                <div class="flex flex-col space-y-1">
                    ${
                      upload.status === "uploading"
                        ? `
                        <button class="cancel-upload text-gray-400 hover:text-red-600 text-xs" 
                                data-upload-id="${upload.id}" 
                                title="Cancel upload">
                            <i class="fas fa-times"></i>
                        </button>
                    `
                        : ""
                    }
                    
                    ${
                      upload.status === "error"
                        ? `
                        <button class="retry-upload text-gray-400 hover:text-blue-600 text-xs" 
                                data-upload-id="${upload.id}" 
                                title="Retry upload">
                            <i class="fas fa-redo"></i>
                        </button>
                    `
                        : ""
                    }
                    
                    ${
                      ["completed", "error", "cancelled"].includes(
                        upload.status
                      )
                        ? `
                        <button class="remove-upload text-gray-400 hover:text-gray-600 text-xs" 
                                data-upload-id="${upload.id}" 
                                title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  cancelUpload(uploadId) {
    const upload = this.uploads.get(uploadId);
    if (!upload) return;

    if (upload.xhr) {
      upload.xhr.abort();
    }

    upload.status = "cancelled";
    this.updateProgressCard(upload);
  }

  retryUpload(uploadId) {
    const upload = this.uploads.get(uploadId);
    if (!upload) return;

    upload.status = "pending";
    upload.progress = 0;
    upload.error = null;
    upload.xhr = null;
    upload.startTime = Date.now();

    this.updateProgressCard(upload);
    this.startUpload(upload);
  }

  removeUpload(uploadId) {
    const upload = this.uploads.get(uploadId);
    if (!upload) return;

    const card = document.getElementById(`upload-${uploadId}`);
    if (card) {
      card.classList.add("translate-x-full");
      setTimeout(() => card.remove(), 300);
    }

    this.uploads.delete(uploadId);
  }

  async triggerResumeAnalysis(fileId) {
    try {
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId }),
      });

      if (response.ok) {
        const result = await response.json();
        this.showSuccess("Resume analysis completed!");

        // Trigger event for resume analysis completion
        document.dispatchEvent(
          new CustomEvent("resumeAnalyzed", {
            detail: result,
          })
        );
      }
    } catch (error) {
      console.error("Resume analysis error:", error);
    }
  }

  // Utility methods
  generateUploadId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getUploadSpeed(upload) {
    if (!upload.startTime || upload.progress === 0) return "";

    const elapsed = (Date.now() - upload.startTime) / 1000;
    const bytesTransferred = (upload.file.size * upload.progress) / 100;
    const speed = bytesTransferred / elapsed;

    return this.formatFileSize(speed) + "/s";
  }

  getFileIcon(filename) {
    const extension = filename.split(".").pop().toLowerCase();

    const iconMap = {
      pdf: "fas fa-file-pdf text-red-500",
      doc: "fas fa-file-word text-blue-500",
      docx: "fas fa-file-word text-blue-500",
      txt: "fas fa-file-alt text-gray-500",
      jpg: "fas fa-file-image text-green-500",
      jpeg: "fas fa-file-image text-green-500",
      png: "fas fa-file-image text-green-500",
      gif: "fas fa-file-image text-green-500",
      mp4: "fas fa-file-video text-purple-500",
      mp3: "fas fa-file-audio text-orange-500",
      zip: "fas fa-file-archive text-yellow-500",
      rar: "fas fa-file-archive text-yellow-500",
    };

    return iconMap[extension] || "fas fa-file text-gray-500";
  }

  showDropMessage(zone, message) {
    let messageEl = zone.querySelector(".drop-message");
    if (!messageEl) {
      messageEl = document.createElement("div");
      messageEl.className =
        "drop-message absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg border-2 border-dashed border-blue-300";
      zone.style.position = "relative";
      zone.appendChild(messageEl);
    }
    messageEl.innerHTML = `
            <div class="text-center">
                <i class="fas fa-cloud-upload-alt text-3xl text-blue-500 mb-2"></i>
                <div class="text-blue-700 font-medium">${message}</div>
            </div>
        `;
  }

  hideDropMessage(zone) {
    const messageEl = zone.querySelector(".drop-message");
    if (messageEl) {
      messageEl.remove();
    }
  }

  showSuccess(message, container = null) {
    this.showNotification(message, "success", container);
  }

  showError(message, container = null) {
    this.showNotification(message, "error", container);
  }

  showNotification(message, type = "info", container = null, duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `notification p-3 rounded-lg text-sm transform transition-all duration-300 ${
      type === "success"
        ? "bg-green-100 text-green-800 border border-green-200"
        : type === "error"
        ? "bg-red-100 text-red-800 border border-red-200"
        : type === "warning"
        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
        : "bg-blue-100 text-blue-800 border border-blue-200"
    }`;

    notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <i class="fas ${
                      type === "success"
                        ? "fa-check-circle"
                        : type === "error"
                        ? "fa-exclamation-circle"
                        : type === "warning"
                        ? "fa-exclamation-triangle"
                        : "fa-info-circle"
                    }"></i>
                    <span>${message}</span>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="text-current opacity-70 hover:opacity-100">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;

    if (container && container.querySelector(".notification-area")) {
      container.querySelector(".notification-area").appendChild(notification);
    } else {
      // Create floating notification
      notification.className +=
        " fixed top-4 right-4 z-50 max-w-sm shadow-lg translate-x-full";
      document.body.appendChild(notification);
      setTimeout(() => notification.classList.remove("translate-x-full"), 100);
    }

    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add(
          container ? "opacity-0" : "translate-x-full"
        );
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  // Public API methods
  getActiveUploads() {
    return Array.from(this.uploads.values()).filter((upload) =>
      ["pending", "uploading"].includes(upload.status)
    );
  }

  getCompletedUploads() {
    return Array.from(this.uploads.values()).filter(
      (upload) => upload.status === "completed"
    );
  }

  clearCompletedUploads() {
    this.uploads.forEach((upload, id) => {
      if (upload.status === "completed") {
        this.removeUpload(id);
      }
    });
  }

  setMaxFileSize(type, size) {
    this.maxFileSizes[type] = size;
  }

  addSupportedType(type, extensions) {
    this.supportedTypes[type] = extensions;
  }
}

// Initialize upload manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.uploadManager = new FileUploadManager();

  // Expose useful methods globally
  window.uploadFile = (file, type = "document") => {
    window.uploadManager.processFiles([file], type);
  };

  window.clearUploads = () => {
    window.uploadManager.clearCompletedUploads();
  };
});
