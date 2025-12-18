// API helper functions per l'education

export async function getModuleById(moduleId: string, locale: string = "it") {
    const response = await fetch(
      `http://localhost:3000/api/education/modules/${moduleId}?locale=${locale}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch module: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  export async function getModuleScenarios(moduleId: string, locale: string = "it") {
    const data = await getModuleById(moduleId, locale);
    return data.content?.scenarios?.items || [];
  }
  
  export async function getModuleProgress(moduleId: string) {
    // Per ora simuliamo - in produzione andrà al backend
    return {
      status: "not_started",
      diagnostic_score: null,
      final_score: null
    };
  }
  
  export async function updateModuleProgress(moduleId: string, data: any) {
    const response = await fetch(
      `http://localhost:3000/api/education/modules/${moduleId}/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }
    );
    
    return response.json();
  }