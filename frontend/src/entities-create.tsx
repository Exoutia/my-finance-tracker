import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { getEntityTypes } from "@/src/service.ts";
import { useQuery } from "@tanstack/react-query";

export default function CreateEntity() {
  const query = useQuery({
    queryKey: ["entity-types"],
    queryFn: getEntityTypes,
  });

  const data: string[] = query.data || [];
  return (
    <Card className="w-full h-1/2 max-w-sm">
      <CardHeader>
        <CardTitle>Create Your Entity</CardTitle>
        <CardDescription>Chose Entity Type</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Entity Type</Label>
              <Select>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Entities</SelectLabel>
                    {data?.map((item) => {
                      // FIX 1: Add the return statement
                      // FIX 2: Add a unique key attribute
                      // FIX 3: Wrap item in curly braces {} to evaluate it
                      return (
                        <SelectItem
                          className="capitalize"
                          key={item}
                          value={item}
                        >
                          {item.split("_").join(" ")}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Enter
        </Button>
      </CardFooter>
    </Card>
  );
}
