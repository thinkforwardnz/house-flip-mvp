
export type ApiConfig = {
  id: string;
  label: string;
  type: 'key' | 'endpoint';
  help: string;
  placeholder?: string;
  link?: string;
};

export const apiConfigStructure: Record<string, ApiConfig[]> = {
  "Property Data": [
    {
      id: 'trademe_endpoint',
      label: 'TradeMe Custom Scraper',
      type: 'endpoint',
      help: 'The URL for your custom scraper, e.g., an ngrok tunnel.',
      placeholder: 'https://....ngrok-free.app',
    },
    {
      id: 'linz_api_key',
      label: 'LINZ API Key',
      type: 'key',
      help: 'For property boundary and title data.',
      placeholder: 'Enter your LINZ API key',
      link: 'https://data.linz.govt.nz/services/api/keys/',
    },
  ],
  "Market Data": [
    {
      id: 'apify_api_token',
      label: 'Apify API Token',
      type: 'key',
      help: 'For scraping Realestate.co.nz & OneRoof.',
      placeholder: 'Enter your Apify API token',
      link: 'https://console.apify.com/account/integrations',
    },
    {
      id: 'google_maps_api_key',
      label: 'Google Maps API Key',
      type: 'key',
      help: 'Required for map views and geocoding.',
      placeholder: 'Enter your Google Maps API Key',
      link: 'https://console.cloud.google.com/google/maps-apis/credentials',
    },
  ],
  "AI & Analysis": [
    {
      id: 'openai_api_key',
      label: 'OpenAI API Key',
      type: 'key',
      help: 'Powers all AI summaries, analysis, and chat features.',
      placeholder: 'Enter your OpenAI API Key',
      link: 'https://platform.openai.com/api-keys',
    },
    {
      id: 'firecrawl_key',
      label: 'Firecrawl API Key',
      type: 'key',
      help: 'Used for advanced, reliable website scraping.',
      placeholder: 'Enter your Firecrawl API Key',
      link: 'https://firecrawl.dev/dashboard'
    }
  ],
};
