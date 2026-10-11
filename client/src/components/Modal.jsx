// Simple pop-up window using Bootstrap's modal styles
function Modal({ title, onClose, children }) {
  return (
    <>
      <div className="modal d-block" tabIndex="-1" onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content card-box">
            <div className="modal-header border-0 px-0 pt-0">
              <h5 className="modal-title">{title}</h5>
              <button className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body px-0 pb-0">{children}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}

export default Modal;
