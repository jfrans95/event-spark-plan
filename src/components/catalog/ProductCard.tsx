import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/context/PackageContext";

interface Props {
  product: Product;
  onAdd: () => void;
}

const ProductCard = ({ product, onAdd }: Props) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted" aria-label={`Imagen de ${product.name}`} />
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{product.name}</h3>
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        {product.provider_name && (
          <p className="text-xs text-muted-foreground">Por {product.provider_name}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="font-semibold">${product.price.toLocaleString("es-CO")} COP</span>
          <Button size="sm" onClick={onAdd}>Agregar</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
