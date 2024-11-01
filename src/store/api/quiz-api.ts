import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQueryWithReauth} from "@src/services/api/baseQuery.ts";
import {IPagination, IQuiz, QuizStatus, SessionStatus} from "@interfaces";
import {Session} from "@src/interfaces/session";

export const quizApi = createApi({
    reducerPath: "quizApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAllQuiz: builder.query<
            IPagination<IQuiz>,
            {
                page?: number;
                perPage?: number;
                search?: string;
                status?: QuizStatus | null;
            }
        >({
            query: ({page = 1, perPage = 10, search = "", status = null}) => ({
                // Use status here instead of quizStatus
                url: `/quiz?page=${page}&perPage=${perPage}&search=${search}&status=${status}`,
                method: "GET",
            }),
        }),

        getAllSessions: builder.query<
            IPagination<Session>,
            {
                page: number;
                perPage?: number;
                search?: string;
                status?: SessionStatus | null;
                quizId: string;
            }
        >({
            query: ({page = 1, perPage = 10, search = "", status = null, quizId}) =>
                `/quiz/${quizId}/sessions?page=${page}&perPage=${perPage}&search=${search}&status=${status}`,
        }),

        createQuiz: builder.mutation<
            IQuiz,
            {
                title: string;
                description: string;
                emailTitle: string;
                status?: string;
                tags: string[];
                footer?: string;
            }
        >({
            query: ({title, description, emailTitle, tags, status, footer}) => ({
                url: `/quiz`,
                method: "POST",
                body: {
                    title: title,
                    description: description,
                    emailTitle: emailTitle,
                    tags: tags,
                    status: status,
                    footer: footer,
                },
            }),
        }),

        getQuizById: builder.query<IQuiz, string>({
            query: (id: string) => ({
                url: `/quiz/${id}`,
                method: "GET",
            }),
        }),

        getQuizByToken: builder.query<IQuiz, string>({
            query: (token: string) => ({
                url: `/quiz?token=${token}`,
                method: "GET",
            }),
        }),

        deleteQuizById: builder.mutation<void, string>({
            query: (id: string) => ({
                url: `/quiz/${id}`,
                method: "DELETE",
            }),
        }),

        updateQuiz: builder.mutation<
            IQuiz,
            {
                id: string;
                title: string;
                description: string;
                emailTitle: string;
                status: string;
                tags: string[];
                footer?: string;
            }
        >({
            query: ({id, title, tags, status, description}) => ({
                url: `quiz/${id}`,
                method: "PUT",
                body: {title, description, tags, status},
            }),
        }),

        getQuizStatistics: builder.query<
            {
                totalSessions: number;
                completedSessions: number;
                count: number;
                averageScorePercentage: number;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                questions: any[];
            },
            { quizId: string; searchEmail: string }
        >({
            query: ({quizId, searchEmail}) => ({
                url: `/statistics/quiz/${quizId}?email=${searchEmail}`,
                method: "GET",
            }),
        }),
        getCompanyAverages: builder.query<
            { company: string; averageScore: number }[],
            string
        >({
            query: (quizId) => ({
                url: `/statistics/quiz/${quizId}/company-averages`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetAllQuizQuery,
    useGetAllSessionsQuery,
    useGetQuizByIdQuery,
    useCreateQuizMutation,
    useDeleteQuizByIdMutation,
    useUpdateQuizMutation,
    useGetQuizStatisticsQuery,
    useGetCompanyAveragesQuery,
} = quizApi;
