<script lang="ts">
  import {
    saveGroupExpense,
    type ExpenseWithOptionalEvent,
    type GroupData,
  } from "$lib/services/group/group.service";
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
  import { prop, sortBy } from "remeda";
  import { z } from "zod";

  export let groupData: GroupData;
  let formError = "";

  const baseSchema = z.object({
    payerId: z
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

  const splitsSumErrorMessage =
    "#zSPOOf Individual amounts must total to the whole expense amount";
  const validateSplitsSum = (form: z.infer<typeof baseSchema>) => {
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

  const schema = baseSchema.refine(validateSplitsSum, {
    message: splitsSumErrorMessage,
  });

  const { form, data, errors, setInitialValues, reset } = createForm<
    z.infer<typeof schema>
  >({
    onSubmit: (values) => {
      const { splits, split, ...rest } = values;

      // Convert the form splits into the expense splits
      const expenseSplits = split
        ? Object.fromEntries(
            Object.entries(splits)
              // Select only the splits which were selected
              .filter(([, split]) => split.checked)
              // Instead of returning an object just get the amount
              .map(([id, split]) => [id, split.amount])
          )
        : undefined;

      // NOTE: We need to explicitly type this here, otherwise `type` will be
      // considered as a `string` by TypeScript and not as `'split' | 'share'`.
      const expense = {
        type: split ? "split" : "share",
        splits: expenseSplits,
        ...rest,
      } as ExpenseWithOptionalEvent;
      saveGroupExpense(groupData, expense)
        .then((result) => {
          if (result.success) {
            dialog.close();
            reset();
          } else {
            formError = result.message;
          }
        })
        .catch((error) => {
          if (error instanceof Error) {
            formError = error.message;
          } else {
            formError = error;
          }
        });
    },
    extend: [validator({ schema }), reporter()],
    validate: (values) => {
      if (!validateSplitsSum(values)) {
        // NOTE: We attach the error for `splits` to the `split` field because
        // we want to show an error for the whole splits if the amounts don't
        // sum correctly. But we can't do that. As the `split` field is a
        // boolean and a checkbox, it can't have any validation errors. Yes,
        // this is a dirty hack.
        return { split: [splitsSumErrorMessage] };
      }
    },
  });

  const today = new Date();
  setInitialValues({
    payerId: "",
    date: `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDay().toString().padStart(2, "0")}`,
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

  const membersArray = sortBy(Object.values(groupData.members), prop("name"));
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
        bind:value={$data.payerId}
        label="Who paid for this expense?"
        name="payer"
        invalid={!!$errors.payerId}
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
      {#each membersArray as { name, id }}
        <div class="row">
          <div class="check">
            <FormField>
              <Checkbox bind:checked={$data.splits[id].checked} />
              <span slot="label">{name}</span>
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
      {#if messages}
        <p class="error">{messages}</p>
      {/if}
    </ValidationMessage>

    {#if formError !== ""}
      <p class="error">{formError}</p>
    {/if}

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
  .error {
    background-color: #f48fb1;
    padding: 1rem;
  }
</style>
