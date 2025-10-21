import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sun, 
  Battery, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SolarTradingDashboard = () => {
  const navigate = useNavigate();
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  
  // Mock data
  const energyData = {
    production: 45.2,
    consumption: 32.1,
    surplus: 13.1,
    balance: 156.8,
    price: 0.12,
    priceChange: 8.5
  };

  const transactions = [
    { id: 1, type: "Sell", amount: 15.5, price: 0.12, total: 1.86, date: "2025-10-20 14:30", status: "Completed" },
    { id: 2, type: "Buy", amount: 8.2, price: 0.11, total: 0.90, date: "2025-10-20 10:15", status: "Completed" },
    { id: 3, type: "Sell", amount: 22.0, price: 0.13, total: 2.86, date: "2025-10-19 16:45", status: "Completed" },
    { id: 4, type: "Buy", amount: 5.0, price: 0.12, total: 0.60, date: "2025-10-19 09:20", status: "Completed" },
  ];

  const initiateUPIPayment = (amount: number, type: 'buy' | 'sell') => {
    const upiId = "solartrading@upi";
    const name = "Solar Trading Platform";
    const total = (amount * energyData.price).toFixed(2);
    
    // UPI deep link format
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR&tn=${encodeURIComponent(`Solar Energy ${type === 'buy' ? 'Purchase' : 'Sale'} - ${amount} kWh`)}`;
    
    // Try to open UPI app
    window.location.href = upiUrl;
  };

  const handleBuy = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      return;
    }
    initiateUPIPayment(parseFloat(buyAmount), 'buy');
    setBuyAmount("");
  };

  const handleSell = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      return;
    }
    if (parseFloat(sellAmount) > energyData.surplus) {
      return;
    }
    initiateUPIPayment(parseFloat(sellAmount), 'sell');
    setSellAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="h-8 w-8 text-warning" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Solar Energy Trading</h1>
                <p className="text-sm text-muted-foreground">Trade renewable energy in real-time</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Energy Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Production Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{energyData.production}</p>
                  <p className="text-sm text-muted-foreground">kWh</p>
                </div>
                <Sun className="h-10 w-10 text-warning" />
              </div>
              <Progress value={75} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="glass-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{energyData.consumption}</p>
                  <p className="text-sm text-muted-foreground">kWh</p>
                </div>
                <Zap className="h-10 w-10 text-secondary" />
              </div>
              <Progress value={60} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="glass-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Energy Surplus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-safe">{energyData.surplus}</p>
                  <p className="text-sm text-muted-foreground">kWh</p>
                </div>
                <Battery className="h-10 w-10 text-safe" />
              </div>
              <Progress value={40} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="glass-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">${energyData.price}</p>
                  <p className="text-sm text-muted-foreground">per kWh</p>
                </div>
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
              <div className="flex items-center gap-1 mt-3">
                <ArrowUpRight className="h-4 w-4 text-safe" />
                <span className="text-sm text-safe font-medium">+{energyData.priceChange}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trading Interface */}
          <Card className="lg:col-span-1 glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trade Energy
              </CardTitle>
              <CardDescription>Buy or sell solar energy instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
                
                <TabsContent value="buy" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buy-amount">Amount (kWh)</Label>
                    <Input
                      id="buy-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                    />
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Price per kWh:</span>
                      <span className="font-medium">${energyData.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-bold text-foreground">
                        ${buyAmount ? (parseFloat(buyAmount) * energyData.price).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleBuy}
                    disabled={!buyAmount}
                  >
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Buy Energy
                  </Button>
                </TabsContent>
                
                <TabsContent value="sell" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sell-amount">Amount (kWh)</Label>
                    <Input
                      id="sell-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      max={energyData.surplus}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available: {energyData.surplus} kWh
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Price per kWh:</span>
                      <span className="font-medium">${energyData.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span className="font-bold text-safe">
                        ${sellAmount ? (parseFloat(sellAmount) * energyData.price).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSell}
                    disabled={!sellAmount || parseFloat(sellAmount) > energyData.surplus}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Sell Energy
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-accent-foreground">Your Balance</span>
                  <span className="text-2xl font-bold text-accent">{energyData.balance} kWh</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="lg:col-span-2 glass-card shadow-card">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent energy trades</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={tx.type === "Sell" ? "border-safe text-safe" : "border-secondary text-secondary"}
                        >
                          {tx.type === "Sell" ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.amount} kWh</TableCell>
                      <TableCell>${tx.price}</TableCell>
                      <TableCell className="font-medium">${tx.total}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{tx.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary text-primary">
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SolarTradingDashboard;