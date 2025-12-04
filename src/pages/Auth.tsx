import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Sparkles, Mail, Lock, User, ArrowRight, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const {
    user,
    signIn,
    signUp,
    loading
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }
  
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await signIn(email, password);
    setIsLoading(false);
  };
  
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    await signUp(email, password, name);
    setIsLoading(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CRM Genius</span>
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Gérez vos prospects<br />
            <span className="text-white/80">comme un pro</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Le CRM intelligent conçu pour les équipes ambitieuses. Suivez, organisez et convertissez vos prospects efficacement.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {['J', 'M', 'A', 'L'].map((letter, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-semibold text-sm"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-white/70 text-sm">
              Rejoignez l'équipe Genius
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-2 text-white/50 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>Propulsé par l'équipe Genius</span>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile header */}
          <div className="lg:hidden flex flex-col items-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">CRM Genius</h1>
          </div>

          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Bienvenue</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à votre espace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
                  <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Inscription
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signin-email" 
                          name="email" 
                          type="email" 
                          placeholder="email@exemple.com" 
                          required 
                          className="pl-10 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signin-password" 
                          name="password" 
                          type="password" 
                          required 
                          className="pl-10 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity text-base font-semibold shadow-lg shadow-primary/25" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Connexion...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Se connecter
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">Prénom Nom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-name" 
                          name="name" 
                          type="text" 
                          placeholder="Jean Dupont" 
                          required 
                          className="pl-10 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-email" 
                          name="email" 
                          type="email" 
                          placeholder="email@exemple.com" 
                          required 
                          className="pl-10 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-password" 
                          name="password" 
                          type="password" 
                          required 
                          className="pl-10 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity text-base font-semibold shadow-lg shadow-primary/25" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Création...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Créer un compte
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Support info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Besoin d'aide ?
            </p>
            <a 
              href="tel:+33637691694" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              +33 6 37 69 16 94
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}