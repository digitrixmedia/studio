import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ingredients } from '@/lib/data';
import { PlusCircle, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InventoryPage() {
  return (
    <Tabs defaultValue="stock">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="recipes">Recipe Mapping</TabsTrigger>
        </TabsList>
        <Sheet>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Ingredient
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Ingredient</SheetTitle>
                <SheetDescription>
                  Add a new raw material to your inventory.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Current Stock</Label>
                  <Input id="stock" type="number" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="min-stock" className="text-right">Min. Stock</Label>
                  <Input id="min-stock" type="number" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unit</Label>
                  <Input id="unit" placeholder="g, ml, pcs" className="col-span-3" />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit">Save Ingredient</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
      </div>
      <TabsContent value="stock">
        <Card>
          <CardHeader>
            <CardTitle>Inventory & Stock Management</CardTitle>
            <CardDescription>
              Track stock of raw materials and get low stock alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Minimum Stock</TableHead>
                  <TableHead className="w-[200px]">Stock Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map(item => {
                  const stockPercentage = (item.stock / (item.minStock * 2)) * 100;
                  const isLowStock = item.stock < item.minStock;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="destructive">
                            {item.stock} {item.unit}
                          </Badge>
                        ) : (
                          `${item.stock} ${item.unit}`
                        )}
                      </TableCell>
                      <TableCell>{item.minStock} {item.unit}</TableCell>
                      <TableCell>
                        <Progress value={stockPercentage} className={isLowStock ? '[&>div]:bg-destructive' : ''} />
                      </TableCell>
                      <TableCell>
                         <Button variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Stock
                          </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="recipes">
        <Card>
           <CardHeader>
            <CardTitle>Recipe Mapping</CardTitle>
            <CardDescription>
              Link menu items to ingredients for automatic stock deduction.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-center text-muted-foreground p-8">Recipe mapping feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
