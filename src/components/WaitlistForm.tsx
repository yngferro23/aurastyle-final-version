import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { createClient } from '@supabase/supabase-js';

interface FormState {
  name: string;
  phone: string;
  email: string;
  social: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WaitlistForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    social: "",
  });
  
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const countryOptions = [
    { code: "+1", label: "US (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+91", label: "IN (+91)" },
    { code: "+61", label: "AU (+61)" },
    { code: "+81", label: "JP (+81)" },
    { code: "+49", label: "DE (+49)" },
    { code: "+33", label: "FR (+33)" },
    { code: "+234", label: "NG (+234)" },
    // Add more as needed
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<FormState> = {};
    
    if (!formState.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formState.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formState.phone.replace(/\D/g, '').length < 6 || formState.phone.replace(/\D/g, '').length > 15) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    // Social is optional, no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Character limits
    const limits: Record<string, number> = {
      name: 50,
      phone: 20,
      email: 100,
      social: 50,
    };
    if (value.length <= (limits[name] || 100)) {
      setFormState(prev => ({ ...prev, [name]: value }));
      // Clear specific error when field is being changed
      if (errors[name as keyof FormState]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Save to Supabase
        const { error } = await supabase.from('waitlist').insert([
          {
            name: formState.name,
            phone: formState.phone,
            email: formState.email,
            social: formState.social,
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
        // Show success state
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "You've been added to the waitlist!",
        });
        // Reset form after delay
        setTimeout(() => {
          setFormState({
            name: "",
            phone: "",
            email: "",
            social: "",
          });
          setIsSuccess(false);
        }, 5000);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "There was a problem submitting your information.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section id="waitlist" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            {!isSuccess ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-display font-bold mb-3">
                    Be First to Get Access
                  </h2>
                  <p className="text-muted-foreground">
                    Join our waitlist and be among the first to try our AI stylist
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formState.name}
                      onChange={handleChange}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                      {formState.name.length}/50
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <PhoneInput
                      country={'us'}
                      enableSearch={true}
                      placeholder="Enter phone number"
                      value={formState.phone}
                      onChange={phone => setFormState(prev => ({ ...prev, phone }))}
                      inputClass="!w-full !h-12 !rounded-md !pl-16 !pr-4 !border !border-neutral-300 focus:outline-none"
                      containerClass="!w-full"
                      buttonClass="!bg-white"
                      dropdownClass="!z-50"
                      disableDropdown={false}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                      {formState.phone.replace(/\D/g, '').length}/15
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formState.email}
                      onChange={handleChange}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social">Instagram / TikTok (Optional)</Label>
                    <Input
                      id="social"
                      name="social"
                      placeholder="@yourusername"
                      value={formState.social}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formState.social.length}/50
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald hover:bg-emerald-dark text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Join the Waitlist"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6 mx-auto w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3 animate-fade-in">
                  Thanks, you're on the list!
                </h3>
                <p className="text-muted-foreground animate-fade-in">
                  You'll be the first to know when we launch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
