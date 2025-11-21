import { ZappyyIcon } from "@/components/icons";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-muted/40 p-4 flex flex-col">
       <header className="flex-shrink-0 mb-4">
          <div className="flex items-center gap-2">
            <ZappyyIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">DineMitra POS - Kitchen Display</h1>
          </div>
       </header>
       <main className="flex-1 overflow-hidden">
        {children}
       </main>
    </div>
  );
}

    