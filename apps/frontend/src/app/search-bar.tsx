import { useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import ReactInputMask from "react-input-mask";

import { ISearchRequest, SearchItem } from "@org/db-and-api-interfaces";
import { useSessionId } from "./use-session-id";

export interface ISearchBarProps {
  isLoading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTableData: React.Dispatch<React.SetStateAction<SearchItem[]>>
}

export function SearchBar({
  isLoading, setLoading, setTableData
}: ISearchBarProps) {

  // Using react-hook-form to manage forms
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = useForm<ISearchRequest>();
  const sessionId = useSessionId();

  // AbortController for request cancellation
  const abortController = useRef(new AbortController());
  const onSubmit: SubmitHandler<ISearchRequest> = (formData) => {
    // If the old request haven't finished, abort it
    if (isLoading) {
      abortController.current.abort();
      console.log('Request cancelled. Initiating a new one.')
      abortController.current = new AbortController();
    }

    // Transform number field value (thanks to masking)
    let { number } = formData;
    if (number !== undefined) {
      number = number.replace(/\D/g, '');
    }

    // Start the request
    setLoading(true);
    axios.post<SearchItem[], AxiosResponse<SearchItem[], unknown>, ISearchRequest>(
      'http://localhost:3000/search',
      { email: formData.email, number },
      {
        signal: abortController.current.signal,
        headers: { Accept: 'application/json', 'User-Id': sessionId }
      }
    ).then(({ data }) => {
      // Change the data in the table
      const responseArray = data;
      setTableData(responseArray);
      setLoading(false);
    })
    .catch(({ message }) => {
      console.log(message)
      if (message !== 'canceled') {
        setLoading(false);
      }
    });
  };

  return (
    <div className="h-36 flex items-center justify-center my-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={"flex items-center justify-center gap-4 " +
          "w-full h-full max-w-xl px-8 py-12 bg-white rounded-lg shadow-md"}
      >
        <div className="flex flex-col relative">
          <div className="flex items-center gap-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email" type="text" {...register("email", { required: true })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ` +
                `focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          {errors.email && <span className="text-sm text-red-500 absolute top-12">This field is required!</span>}
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="number" className="block text-sm font-medium text-gray-700">Number</label>
          {/* TODO: Rewrite using a controlled component
            * and without react-input-mask
            */}
          <ReactInputMask
            id="number"
            type="text"
            mask={"99-99-99"}
            maskPlaceholder={null}
            alwaysShowMask={false}
            {...register("number", { pattern: /^\d{0,2}(-\d{0,2}){0,2}$/ })}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ` +
              `focus:ring-blue-500 ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        

        {/* Thanks to !isDirty user can try to submit an empty form,
          * But they will ecnounter validation errors, nevertheless
          */}
        <button
          type="submit" disabled={!isDirty && !isValid}
          className={`w-md py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            (!isDirty && !isValid) ?
              'bg-gray-400 cursor-not-allowed' :
              'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}>
          Submit
        </button>
      </form>
    </div>
  );
}