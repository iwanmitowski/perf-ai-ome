import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

export function FeedCard({ item }) {
  return (
    <Link to="/feed/$id" params={{ id: item.id }} className="block">
      <Card className="overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
        <CardHeader className="p-0">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="aspect-[16/10] w-full object-cover"
          />
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="mb-2 text-xl">{item.title}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {item.summary}
          </p>
        </CardContent>
        {item.tags && item.tags.length > 0 && (
          <CardFooter className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}

export function FeedCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="p-4 pt-0">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
