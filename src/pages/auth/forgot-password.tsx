import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = userType === "customer" 
        ? "/auth/forget-password-customer" 
        : "/auth/forget-password-salon";

      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setSuccess("Password reset email sent! Please check your inbox and follow the instructions.");
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error instanceof Error) {
        const errorMessage = error.message;
        console.log('Error message:', errorMessage);
        
        // Try to parse validation errors from the error message
        try {
          const errorData = JSON.parse(errorMessage);
          console.log('Parsed error data:', errorData);
          
                     if (errorData.errors && Array.isArray(errorData.errors)) {
             // Extract error messages from the validation errors array
             const errorMessages = errorData.errors.map((err: any) => {
               console.log('Processing error object:', err);
               console.log('Error type:', typeof err);
               console.log('Error keys:', Object.keys(err));
               
               // Try different possible error message fields
               const errorMsg = err.msg || err.message || err.error || err.value || JSON.stringify(err);
               console.log('Extracted error message:', errorMsg);
               return errorMsg;
             });
             console.log('Final error messages:', errorMessages);
             setValidationErrors(errorMessages);
             setError("Please fix the following validation errors:");
           } else if (errorData.message) {
            setError(errorData.message);
            setValidationErrors([]);
          } else {
            setError(errorMessage);
            setValidationErrors([]);
          }
                 } catch (parseError) {
           console.log('Failed to parse error as JSON:', parseError);
           console.log('Raw error message:', errorMessage);
           
           // If not JSON, treat as regular error message
           setError(errorMessage);
           setValidationErrors([]);
         }
      } else {
        setError("Network error. Please check your connection and try again.");
        setValidationErrors([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Forgot Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
                     {error && (
             <Alert className="mb-4 border-red-200 bg-red-50">
               <AlertDescription className="text-red-800">
                 {error}
               </AlertDescription>
             </Alert>
           )}
           
           {validationErrors.length > 0 && (
             <Alert className="mb-4 border-orange-200 bg-orange-50">
               <AlertDescription className="text-orange-800">
                 <ul className="list-disc list-inside space-y-1">
                   {validationErrors.map((err, index) => (
                     <li key={index}>{err}</li>
                   ))}
                 </ul>
               </AlertDescription>
             </Alert>
           )}
          
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Account Type</Label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                <option value="customer">Customer</option>
                <option value="salon">Salon Owner</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Email...
                </>
              ) : (
                "Send Reset Email"
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/auth/login")}
                disabled={isLoading}
                className="text-sm"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage; 