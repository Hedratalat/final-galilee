import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // تأكد من استدعاء auth
import { sendEmailVerification } from "firebase/auth";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [isEnglish, setIsEnglish] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error(isEnglish ? "No user logged in" : "لا يوجد مستخدم مسجل دخول");
      return;
    }

    try {
      setIsSending(true);
      await sendEmailVerification(user);
      toast.success(
        isEnglish
          ? "Verification email resent Please check your inbox."
          : "تم إعادة إرسال رابط التفعيل تحقق من بريدك."
      );
    } catch (error) {
      //   console.error("Error resending email:", error);
      toast.error(
        isEnglish ? "Error Please try again." : "حدث خطأ حاول مرة أخرى."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 bg-gray-100 relative">
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 bg-darkBlue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg z-50 font-semibold"
      >
        {isEnglish ? "عربي" : "English"}
      </button>

      <div className="bg-white shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-darkBlue mb-4 font-poppins">
          {isEnglish ? "Verify Your Email" : "تفعيل بريدك الإلكتروني"}
        </h2>
        <p className="text-gray-700 mb-6">
          {isEnglish ? (
            <>
              A verification link has been sent to your email.
              <br />
              Please check your inbox{" "}
              <span className="text-red-500">(or Spam folder)</span> to activate
              your account.
            </>
          ) : (
            <>
              تم إرسال رابط التفعيل إلى بريدك الإلكتروني.
              <br />
              من فضلك تحقق من بريدك{" "}
              <span className="text-red-500">(أو مجلد Spam)</span> لتفعيل
              الحساب.
            </>
          )}
        </p>

        {/* زر إعادة الإرسال */}
        <button
          onClick={handleResend}
          disabled={isSending}
          className="bg-gray-300 text-darkBlue font-bold py-2 px-4 rounded-2xl shadow-lg hover:bg-gray-400 
          transition duration-300 mb-4 mr-4"
        >
          {isEnglish
            ? isSending
              ? "Resending..."
              : "Resend Email"
            : isSending
            ? "جاري الإرسال..."
            : "إعادة إرسال الرابط"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="bg-orange text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:bg-darkBlue transition duration-300"
        >
          {isEnglish ? "Login" : "تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}
