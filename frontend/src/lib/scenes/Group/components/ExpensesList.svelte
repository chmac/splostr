<script lang="ts">
  import type { GroupData } from "$lib/services/group.service";
  import { reporter, ValidationMessage } from "@felte/reporter-svelte";
  import { validator } from "@felte/validator-zod";
  import Button from "@smui/button";
  import Checkbox from "@smui/checkbox";
  import FormField from "@smui/form-field";
  import List, { Item, PrimaryText, SecondaryText, Text } from "@smui/list";
  import Select, { Option } from "@smui/select";
  import Switch from "@smui/switch";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { createForm } from "felte";
  import { z } from "zod";

  export let groupData: GroupData;

  const baseSchema = z.object({
    payer: z
      .string()
      .refine(
        (payer) => Object.keys(groupData.members).includes(payer),
        "#HiJrTd You must choose one of the members"
      ),
    subject: z.string().min(3),
    date: z
      .string()
      .regex(
        /[0-9]{4}-[0-9]{2}-[0-9]{2}/,
        "#ACd1wY Please enter a date like YYYY-MM-DD"
      ),
    amount: z
      .string()
      .regex(
        /^[0-9]+(?:\.[0-9]+)?$/,
        "#wd4WLB Please enter only numbers like 12.00"
      ),
    split: z.boolean().default(false),
    splits: z.record(
      z.object({
        id: z.string(),
        checked: z.boolean(),
        amount: z.string(),
      })
    ),
  });

  const validateSplits = (form: z.infer<typeof baseSchema>) => {
    console.log("#eNQ3cf validateSplits()", form);
    if (form.split === true) {
      const splitsArray = Object.values(form.splits);

      const noSplitsHaveAmounts = splitsArray.every(
        (split) => split.amount === ""
      );

      if (noSplitsHaveAmounts) {
        return true;
      }

      const sum = splitsArray.reduce(
        (sum, split) => (split.checked ? sum + parseFloat(split.amount) : sum),
        0
      );
      if (sum != parseFloat(form.amount)) {
        return false;
      }
    }
    return true;
  };

  const schema = baseSchema.refine(validateSplits, {
    message:
      "#zSPOOf Individual amounts must total to the whole expense amount",
    // NOTE: We attach the error for `splits` to the `split` field because we
    // want to show an error for the whole splits if the amounts don't sum
    // correctly. But we can't do that. As the `split` field is a boolean and a
    // checkbox, it can't have any validation errors. Yes, this is a dirty hack.
    path: ["split"],
  });

  const { form, data, errors, setInitialValues } = createForm<
    z.infer<typeof schema>
  >({
    onSubmit: (values) => {
      debugger;
      console.log("#s8J9f3 felte values", values);
    },
    extend: [validator({ schema }), reporter()],
  });
  $: {
    console.log("#wQU3Vf errors", $errors);
  }

  setInitialValues({
    payer: "",
    date: "",
    subject: "",
    amount: "",
    split: false,
    splits: Object.entries(groupData.members).reduce<
      z.infer<typeof baseSchema.shape.splits>
    >((splits, [id, split]) => {
      return {
        ...splits,
        [id]: {
          id: split.id,
          checked: false,
          amount: "",
        },
      };
    }, {}),
  });

  let dialog: HTMLDialogElement;
</script>

<h3>Expenses</h3>
<List threeLine nonInteractive>
  {#each groupData.expenses as expense}
    <Item>
      <Text>
        <PrimaryText>{expense.subject}</PrimaryText>
        <SecondaryText>{expense.amount} on {expense.date}</SecondaryText>
        <SecondaryText>{expense.type}</SecondaryText>
      </Text>
    </Item>
  {/each}
</List>

<Button on:click={() => dialog.showModal()}>Add an expense</Button>

<dialog bind:this={dialog}>
  <form method="dialog" use:form>
    <h2>Add an expense</h2>
    <p>
      <Select
        bind:value={$data.payer}
        label="Who paid for this expense?"
        name="payer"
        invalid={!!$errors.payer}
      >
        {#each Object.entries(groupData.members) as [_id, member]}
          <Option value={member.id}>{member.name}</Option>
        {/each}
      </Select>
    </p>
    <p>
      <Textfield
        label="Subject"
        style="width: 100%;"
        required
        bind:value={$data.subject}
        input$emptyValueUndefined
        invalid={!!$errors.subject}
      >
        <HelperText slot="helper">
          <ValidationMessage for="subject" let:messages>
            {messages || ""}
          </ValidationMessage>
        </HelperText>
      </Textfield>
    </p>
    <p>
      <Textfield
        type="text"
        label="Date"
        required
        bind:value={$data.date}
        input$emptyValueUndefined
        invalid={!!$errors.date}
      >
        <HelperText slot="helper">
          <ValidationMessage level="error" for="date" let:messages>
            {messages || ""}
          </ValidationMessage>
        </HelperText>
      </Textfield>
    </p>
    <p>
      <Textfield
        label="Amount"
        bind:value={$data.amount}
        input$emptyValueUndefined
        invalid={!!$errors.amount}
        required
      >
        <HelperText slot="helper">
          <ValidationMessage level="error" for="amount" let:messages>
            {messages || ""}
          </ValidationMessage>
        </HelperText>
      </Textfield>
    </p>
    <p>
      Split this expense? <Switch
        bind:checked={$data.split}
        color="secondary"
        name="split"
      />
    </p>
    {#if $data.split}
      <p>Which members should it be shared with?</p>
      {#each Object.entries(groupData.members) as [id, member]}
        <div class="row">
          <div class="check">
            <FormField>
              <Checkbox bind:checked={$data.splits[id].checked} />
              <span slot="label">{member.name}</span>
            </FormField>
          </div>
          <div class="amount">
            <Textfield
              label="Amount"
              type="text"
              style="height: 1.2rem; width: 4rem;"
              bind:value={$data.splits[id].amount}
            />
          </div>
        </div>
      {/each}
    {/if}

    <ValidationMessage for="split" let:messages>
      {messages || ""}
    </ValidationMessage>

    <p class="buttons">
      <Button type="reset" on:click={() => dialog.close()}>Cancel</Button>
      <Button type="submit">Save</Button>
    </p>
  </form>
</dialog>

<style>
  dialog::backdrop {
    background-color: lightgrey;
    opacity: 0.8;
  }
  p.buttons {
    display: flex;
    justify-content: flex-end;
  }
  .row {
    display: flex;
    align-items: center;
  }
  .amount {
    padding-top: 4px;
    padding-left: 12px;
  }
</style>
