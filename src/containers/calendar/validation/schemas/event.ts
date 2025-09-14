import { object, string } from "yup";

export const schema = object({
  title: string().required("Назва обовʼязкова").max(30, "Максимум 30 символів"),
});
