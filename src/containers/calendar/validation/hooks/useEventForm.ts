import { useForm } from "vee-validate";
import { schema } from "../schemas/event";
import { reactive } from "vue";

export const useEventForm = () => {
  const { defineField, handleSubmit, errors } = useForm({
    validationSchema: schema,
  });

  const [title] = defineField("title");

  const form = reactive({
    title: title,
    date: "",
    time: "",
    notes: "",
    color: "",
  });

  return {
    form,
    errors,
    handleSubmit,
  };
};
