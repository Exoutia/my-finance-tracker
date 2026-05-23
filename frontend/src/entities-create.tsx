import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
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
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";
import CreateEntityForm from "@/src/create-entity-form.tsx";
import { useCreateEntityTypeStore } from "@/src/stores/createEntityStore.ts";

export default function CreateEntity() {
  const query = useQuery({
    queryKey: ["entity-types"],
    queryFn: getEntityTypes,
  });

  const data: string[] = query.data || [];
  const selectedValue = useCreateEntityTypeStore((state) =>
    state.selectedValue
  );
  const setSelectedValue = useCreateEntityTypeStore((state) =>
    state.setSelectedValue
  );
  return (
    <Dialog>
      <Card className="w-full h-full max-w-xl my-5 mx-5">
        <CardHeader>
          <CardTitle>Create Your Entity</CardTitle>
          <CardDescription>Chose Entity Type</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-row justify-between gap-6">
              <div className="grid w-full gap-2">
                <Label htmlFor="email">Entity Type</Label>
                <Select
                  value={selectedValue}
                  onValueChange={setSelectedValue}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="Select Entity Type"
                      className="capitalize"
                    >
                      {selectedValue
                        ? selectedValue.split("_").map((item) => {
                          return item.at(0).toUpperCase() + item.slice(1);
                        }).join(" ")
                        : ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectGroup>
                      <SelectLabel>Entities</SelectLabel>
                      {data?.map((item) => {
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
              <div className="grid w-full gap-2">
                <Label>Tags</Label>
                <Input />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button
              disabled={selectedValue ? false : true}
              type="submit"
              className="w-1/3"
            >
              Enter
            </Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      <CreateEntityForm />
    </Dialog>
  );
}
