import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { vendors } from "@/lib/data";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fornecedores"
        title="Rede de fornecedores por evento"
        description="Controle parceiros, orçamentos, contatos e status de contratação para estrutura física, audiovisual e apoio."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {vendors.map((vendor) => (
          <Card key={vendor.name}>
            <CardHeader>
              <CardTitle>{vendor.name}</CardTitle>
              <CardDescription>{vendor.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="warning">{vendor.status}</Badge>
              <p className="mt-4 text-sm text-muted-foreground">{vendor.contact}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
