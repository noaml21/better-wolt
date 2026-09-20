import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Field, Icon, InlineMessage, RadioGroup, useToast } from '../components/ui';
import AuthLayout from '../components/auth/AuthLayout';
import './RegisterPage.css';

const EMPTY = {
  username: '',
  displayName: '',
  email: '',
  address: '',
  password: '',
  confirm: '',
  role: 'customer',
};

/* The password rule mirrors the server's, which answers
   "Password must be 8-72 UTF-8 bytes and contain at least one letter and
   one digit" (ARCHITECTURE §4.3). Checking it here saves a round trip;
   the server still decides. */
function validate(values) {
  const errors = {};

  if (!values.username.trim()) errors.username = 'צריך שם משתמש.';
  if (!values.displayName.trim()) errors.displayName = 'איך לקרוא לכם?';
  if (!values.email.trim()) errors.email = 'צריך כתובת אימייל.';
  if (!values.address.trim()) errors.address = 'לאן שולחים את ההזמנות?';

  if (values.password.length < 8 || !/\d/.test(values.password) || !/[a-zA-Z]/.test(values.password)) {
    errors.password = 'לפחות 8 תווים, עם אות אחת וספרה אחת.';
  }

  if (values.confirm !== values.password) {
    errors.confirm = 'הסיסמאות לא זהות.';
  }

  return errors;
}

export default function RegisterPage() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setAvatar(null);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(values);

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: values.username.trim(),
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
        password: values.password,
        image: avatar || '',
        role: values.role,
      });

      await login(values.username.trim(), values.password);
      showToast('החשבון נוצר. ברוכים הבאים!');
      navigate('/');
    } catch (requestError) {
      setFormError(requestError.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="פתיחת חשבון"
      subtitle="דקה אחת, ואפשר להזמין."
      footer={
        <>
          כבר יש לכם חשבון? <Link to="/login">כניסה</Link>
        </>
      }
      aside={
        <div className="bw-auth__aside-quote">
          <strong>מצטרפים פעם אחת.</strong>
          <span>הכתובת נשמרת, ההזמנה הבאה לוקחת שתי הקשות.</span>
        </div>
      }
    >
      <form className="bw-stack" onSubmit={handleSubmit} noValidate>
        {formError && <InlineMessage>{formError}</InlineMessage>}

        <div className="bw-register__grid">
          <Field
            label="שם משתמש"
            name="username"
            value={values.username}
            onChange={handleChange}
            error={errors.username}
            autoComplete="username"
            required
          />
          <Field
            label="שם לתצוגה"
            name="displayName"
            value={values.displayName}
            onChange={handleChange}
            error={errors.displayName}
            autoComplete="name"
            required
          />
        </div>

        <Field
          label="אימייל"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          required
        />

        <Field
          label="כתובת למשלוח"
          name="address"
          value={values.address}
          onChange={handleChange}
          error={errors.address}
          autoComplete="street-address"
          placeholder="רחוב, מספר, עיר"
          required
        />

        <div className="bw-register__grid">
          <Field
            label="סיסמה"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            hint="8 תווים לפחות, אות וספרה."
            autoComplete="new-password"
            required
          />
          <Field
            label="אימות סיסמה"
            name="confirm"
            type="password"
            value={values.confirm}
            onChange={handleChange}
            error={errors.confirm}
            autoComplete="new-password"
            required
          />
        </div>

        <RadioGroup
          label="איזה חשבון לפתוח?"
          name="role"
          value={values.role}
          onChange={handleChange}
          options={[
            { value: 'customer', label: 'לקוח', description: 'להזמין אוכל' },
            { value: 'restaurant', label: 'בעלי מסעדה', description: 'לנהל תפריט' },
          ]}
        />

        <div className="bw-register__avatar">
          <span className="bw-register__avatar-preview">
            {avatar ? <img src={avatar} alt="" /> : <Icon name="user" size={26} />}
          </span>

          <div className="bw-register__avatar-text">
            <Button variant="secondary" size="sm" icon="user" onClick={() => fileInputRef.current?.click()}>
              {avatar ? 'החלפת התמונה' : 'הוספת תמונת פרופיל'}
            </Button>
            <p className="bw-meta">לא חובה. אפשר להוסיף גם אחר כך.</p>
          </div>

          <input
            ref={fileInputRef}
            className="bw-visually-hidden"
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            aria-label="בחירת תמונת פרופיל"
          />
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          יצירת החשבון
        </Button>
      </form>
    </AuthLayout>
  );
}
