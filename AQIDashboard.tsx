import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Wind, Droplets, Eye, AlertCircle, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AQIData {
  aqi: number;
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
  location: string;
}

const AQIDashboard = () => {
  const [location, setLocation] = useState("");
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAQILevel = (aqi: number) => {
    if (aqi === 1) return { label: "Good", color: "safe", description: "Air quality is satisfactory" };
    if (aqi === 2) return { label: "Fair", color: "moderate", description: "Air quality is acceptable" };
    if (aqi === 3) return { label: "Moderate", color: "warning", description: "Sensitive groups may experience symptoms" };
    if (aqi === 4) return { label: "Poor", color: "unhealthy", description: "Everyone may begin to experience health effects" };
    return { label: "Very Poor", color: "hazardous", description: "Health alert: everyone may experience serious effects" };
  };

  const fetchAQIData = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a city name or coordinates",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Using OpenWeatherMap Geocoding API to get coordinates
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=YOUR_API_KEY`
      );
      
      if (!geoResponse.ok) {
        throw new Error("Location not found");
      }

      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error("Location not found");
      }

      const { lat, lon, name, country } = geoData[0];

      // Fetch AQI data
      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=YOUR_API_KEY`
      );

      if (!aqiResponse.ok) {
        throw new Error("Failed to fetch AQI data");
      }

      const aqiResult = await aqiResponse.json();
      
      setAqiData({
        aqi: aqiResult.list[0].main.aqi,
        components: aqiResult.list[0].components,
        location: `${name}, ${country}`,
      });

      toast({
        title: "Success",
        description: `AQI data loaded for ${name}, ${country}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch AQI data. Please add your OpenWeatherMap API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const aqiLevel = aqiData ? getAQILevel(aqiData.aqi) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">AQI Dashboard</h1>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section */}
        <Card className="mb-8 shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Search
            </CardTitle>
            <CardDescription>
              Enter a city name or address to check air quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="e.g., London, Paris, New York..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchAQIData()}
                className="flex-1"
              />
              <Button onClick={fetchAQIData} disabled={loading}>
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AQI Display */}
        {aqiData && aqiLevel && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Main AQI Card */}
            <Card className={`shadow-elevated border-2 border-${aqiLevel.color}/20`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Gauge className="h-6 w-6 text-primary" />
                    {aqiData.location}
                  </span>
                  <span className={`px-4 py-2 rounded-full bg-${aqiLevel.color}/10 text-${aqiLevel.color} font-semibold border border-${aqiLevel.color}/20`}>
                    {aqiLevel.label}
                  </span>
                </CardTitle>
                <CardDescription>{aqiLevel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className={`text-7xl font-bold text-${aqiLevel.color} mb-4`}>
                    {aqiData.aqi}
                  </div>
                  <p className="text-muted-foreground">Air Quality Index</p>
                </div>
              </CardContent>
            </Card>

            {/* Pollutants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wind className="h-4 w-4 text-primary" />
                    PM2.5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.pm2_5.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wind className="h-4 w-4 text-primary" />
                    PM10
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.pm10.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-secondary" />
                    NO₂
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.no2.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4 text-accent" />
                    O₃
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.o3.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    CO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.co.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wind className="h-4 w-4 text-destructive" />
                    SO₂
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.so2.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-primary" />
                    NO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.no.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-secondary" />
                    NH₃
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {aqiData.components.nh3.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </CardContent>
              </Card>
            </div>

            {/* Health Recommendations */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Health Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aqiData.aqi === 1 && (
                  <p className="text-foreground">Air quality is good. Enjoy outdoor activities!</p>
                )}
                {aqiData.aqi === 2 && (
                  <p className="text-foreground">Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor activities.</p>
                )}
                {aqiData.aqi === 3 && (
                  <p className="text-foreground">Sensitive groups (children, elderly, people with respiratory conditions) should limit prolonged outdoor activities.</p>
                )}
                {aqiData.aqi === 4 && (
                  <p className="text-foreground">Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor activities.</p>
                )}
                {aqiData.aqi === 5 && (
                  <p className="text-foreground">Health alert! Everyone should avoid prolonged outdoor activities. Stay indoors with windows closed.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Card when no data */}
        {!aqiData && !loading && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Gauge className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Search for a Location</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a city name above to view real-time air quality data and pollutant levels
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AQIDashboard;
