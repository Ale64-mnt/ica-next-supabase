// File: app/lib/auth/user-context.ts
export async function getCurrentUser() {
    // Per ora ritorna un oggetto mock per far funzionare la build
    // Dopo integrerai con Supabase
    return {
      id: 'user-mock-id',
      email: 'mock@example.com',
      ageRange: '11-15'
    };
  }
  
  export async function getCurrentUserAgeRange(): Promise<string> {
    // Per MVP, hardcodiamo 11-15
    return '11-15';
  }
  