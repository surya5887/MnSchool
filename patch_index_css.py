with open('src/index.css', 'a', encoding='utf-8') as f:
    f.write("""
/* Submit Dock UI Styles */
.submit-dock-wrapper {
  position: sticky;
  bottom: 24px;
  z-index: 100;
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 32px;
}
.submit-dock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 16px 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
  width: 100%;
  flex-wrap: wrap;
}
.submit-notice-icon {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  padding: 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
}
.submit-notice-title {
  margin: 0 0 6px 0;
  color: #1e293b;
  font-size: 1.05rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.3px;
}
.submit-notice-title span {
  background: #fef2f2;
  color: #ef4444;
  font-size: 0.65rem;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.5px;
  border: 1px solid #fee2e2;
}
.submit-notice-text {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.4;
  font-weight: 500;
}
.submit-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .submit-dock-wrapper {
    bottom: 12px !important;
    margin-top: 16px !important;
  }
  .submit-dock {
    padding: 12px !important;
    gap: 12px !important;
    border-radius: 16px !important;
    flex-direction: column;
    align-items: stretch;
  }
  .submit-notice-container {
    gap: 10px !important;
  }
  .submit-notice-icon {
    display: none !important;
  }
  .submit-notice-title {
    font-size: 0.85rem !important;
    margin-bottom: 2px !important;
    gap: 6px !important;
  }
  .submit-notice-text {
    font-size: 0.75rem !important;
    line-height: 1.25 !important;
  }
  .submit-notice-title span {
    font-size: 0.55rem !important;
    padding: 2px 6px !important;
  }
  .submit-buttons {
    width: 100%;
    display: flex;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 8px !important;
  }
  .submit-buttons button {
    flex: 1;
    padding: 10px 12px !important;
    font-size: 0.85rem !important;
    justify-content: center;
    border-radius: 12px !important;
    white-space: nowrap;
  }
  .submit-buttons button svg {
    width: 16px !important;
    height: 16px !important;
  }
}
""")
print("Appended styles.")
