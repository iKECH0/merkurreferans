import toast from 'react-hot-toast';

export const customConfirm = (message) => {
  return new Promise((resolve) => {
    const toastId = toast.custom(
      (t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}
          style={{ 
            padding: '1.5rem', 
            borderRadius: '16px', 
            background: '#0f172a', 
            border: '1px solid rgba(59, 130, 246, 0.5)', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)', 
            maxWidth: '350px', 
            width: '90vw',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            fontFamily: 'var(--font-outfit), sans-serif'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#3b82f6', fontSize: '1.5rem' }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>Emin misiniz?</h3>
          </div>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.4' }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              onClick={() => { toast.dismiss(toastId); resolve(false); }} 
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '0.9rem' }}
            >
              Vazgeç
            </button>
            <button 
              onClick={() => { toast.dismiss(toastId); resolve(true); }} 
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '0.9rem' }}
            >
              Onayla
            </button>
          </div>
        </div>
      ), 
      { duration: Infinity, position: 'top-center' }
    );
  });
};

export const customPrompt = (message, defaultValue = "") => {
  return new Promise((resolve) => {
    let inputValue = defaultValue;
    const toastId = toast.custom(
      (t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}
          style={{ 
            padding: '1.5rem', 
            borderRadius: '16px', 
            background: '#0f172a', 
            border: '1px solid rgba(16, 185, 129, 0.5)', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)', 
            maxWidth: '350px', 
            width: '90vw',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            fontFamily: 'var(--font-outfit), sans-serif'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem' }}>✍️</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>Bilgi Girişi</h3>
          </div>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.4' }}>{message}</p>
          <input 
            type="text"
            defaultValue={defaultValue}
            onChange={(e) => { inputValue = e.target.value; }}
            autoFocus
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '1rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              onClick={() => { toast.dismiss(toastId); resolve(null); }} 
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '0.9rem' }}
            >
              İptal
            </button>
            <button 
              onClick={() => { toast.dismiss(toastId); resolve(inputValue); }} 
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '0.9rem' }}
            >
              Kaydet
            </button>
          </div>
        </div>
      ), 
      { duration: Infinity, position: 'top-center' }
    );
  });
};
