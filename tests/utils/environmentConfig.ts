import * as fs from 'fs';
import * as path from 'path';

interface EnvironmentConfig {
  UI_URL: string;
  API_URL: string;
}

export function getEnvironmentConfig(env?: string): EnvironmentConfig {
  const envFile = path.resolve(__dirname, '../../environment.properties');
  const content = fs.readFileSync(envFile, 'utf-8');
  
  const config: { [key: string]: string } = {};
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key, value] = line.split('=');
    if (key && value) {
      config[key.trim()] = value.trim();
    }
  });

  // Get environment from parameter, environment variable, or default
  const environment = env || process.env.TEST_ENV || config['DEFAULT_ENV'] || 'TST';
  
  console.log(`🌍 Using ${environment} environment`);
  
  return {
    UI_URL: config[`${environment}_UI_URL`] || config['TST_UI_URL'],
    API_URL: config[`${environment}_API_URL`] || config['TST_API_URL']
  };
}

