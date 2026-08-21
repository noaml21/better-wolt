import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api'
const RegisterPage = () => {
    // איחדנו את כל השדות לאובייקט State אחד כדי שיהיה נוח לנהל אותם
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        email: '',
        password: '',
        confirm: '',
        address: '',
        role: 'customer'
    });

    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // פונקציה חכמה שמעדכנת את השדה הספציפי שהשתנה מתוך האובייקט
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, displayName, email, password, confirm, address } = formData;

        // ולידציות של עמוד הרשמה
        if (!username.trim() || !displayName.trim() || !email.trim() || !password || !confirm || !address.trim()) {
            return setError('יש למלא את כל שדות החובה 🙃');
        }
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return setError('הסיסמה חייבת להכיל לפחות 8 תווים, כולל אות וספרה.');
        }
        if (password !== confirm) {
            return setError('הסיסמאות אינן תואמות.');
        }

        setError('');
        try {
            const payload = {
                username: formData.username,
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password,
                address: formData.address,
                image: preview || '',
                role: formData.role
            };

            await registerUser(payload);

            alert('הרשמה עברה ולידציה בהצלחה! מעביר להתחברות...');
            navigate('/login');
        } catch(err){
            setError('ההרשמה נכשלה' + err.message);
        }
    };

    return (
        <div className="auth-page">
            <h2>הרשמה למערכת 📝</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>שם משתמש</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="בחר שם משתמש" />
                </div>

                <div className="form-group">
                    <label>שם תצוגה</label>
                    <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="איך תרצה שנקרא לך?" />
                </div>

                <div className="form-group">
                    <label>כתובת אימייל</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="הזן אימייל" />
                </div>

                <div className="form-group">
                    <label>כתובת משלוח</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="הזן כתובת מלאה" />
                </div>

                <div className="form-group">
                    <label>סיסמה</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="8 תווים, אות וספרה" />
                </div>

                <div className="form-group">
                    <label>אימות סיסמה</label>
                    <input type="password" name="confirm" value={formData.confirm} onChange={handleChange} placeholder="הקלד סיסמה שוב" />
                </div>

                <div className="form-group" style={{ textAlign: 'right', margin: '15px 0' }}>
                    <label style={{ fontWeight: 'bold' }}>אני נרשמ/ת בתור:</label>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                        <label>
                            <input type="radio" name="role" value="customer" checked={formData.role === 'customer'} onChange={handleChange} />
                            לקוח
                        </label>
                        <label>
                            <input type="radio" name="role" value="restaurant" checked={formData.role === 'restaurant'} onChange={handleChange} />
                            בעל מסעדה
                        </label>
                    </div>
                </div>

                <div className="form-group" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current.click()} style={{ backgroundColor: '#5f6b7a', marginBottom: '10px' }}>
                        📸 בחר תמונת פרופיל
                    </button>

                    {preview && (
                        <div style={{ marginTop: '10px' }}>
                            <img src={preview} alt="תצוגה מקדימה" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--wolt-purple)' }} />
                        </div>
                    )}
                </div>

                <button type="submit" className="submit-btn">צור חשבון</button>
            </form>

            <p className="auth-switch">
                כבר יש לך חשבון? <Link to="/login">היכנס כאן</Link>
            </p>
        </div>
    );
};

export default RegisterPage;
