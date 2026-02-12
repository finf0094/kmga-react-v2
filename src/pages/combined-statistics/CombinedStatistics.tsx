import {FC, Suspense, useEffect, useMemo, useState} from "react";
import React from "react";
import {
    useGetAllQuizQuery,
    useGetCombinedStatisticsMutation,
} from "@store/api/quiz-api.ts";
import "./CombinedStatistics.css";
import UITitle from "@src/components/Base UI/UITitle";
import {Loader} from "@src/components";

// Lazy load the Bar component
const LazyBar = React.lazy(() =>
    import("react-chartjs-2").then(({Bar}) => {
        return import("chart.js").then((chartjs) => {
            chartjs.Chart.register(
                chartjs.BarElement,
                chartjs.CategoryScale,
                chartjs.LinearScale,
                chartjs.Tooltip,
                chartjs.Legend
            );
            return {default: Bar};
        });
    })
);

// Мок данные для годов до 2024
const MOCK_DATA: Record<number, { totalSessions: number; completedSessions: number }> = {
    2019: {totalSessions: 92, completedSessions: 7},
    2020: {totalSessions: 83, completedSessions: 8},
    2021: {totalSessions: 33, completedSessions: 5},
    2022: {totalSessions: 44, completedSessions: 9},
    2023: {totalSessions: 40, completedSessions: 11},
};

const CombinedStatisticsPage: FC = () => {
    // LOCAL STATE
    const [selectedQuizIds, setSelectedQuizIds] = useState<string[]>([]);

    // API
    const {data: quizData, isLoading: quizLoading} = useGetAllQuizQuery({
        page: 1,
        perPage: 100,
    });
    const [getCombinedStats, {data: statsData, isLoading: statsLoading}] =
        useGetCombinedStatisticsMutation();

    // Загружаем статистику при изменении выбранных квизов
    useEffect(() => {
        if (selectedQuizIds.length > 0) {
            getCombinedStats({quizIds: selectedQuizIds});
        }
    }, [selectedQuizIds, getCombinedStats]);

    // Обработчик выбора survey через чекбокс
    const handleQuizToggle = (quizId: string) => {
        setSelectedQuizIds((prev) => {
            if (prev.includes(quizId)) {
                return prev.filter((id) => id !== quizId);
            } else {
                return [...prev, quizId];
            }
        });
    };

    // Выбрать все / снять все
    const handleSelectAll = () => {
        if (selectedQuizIds.length === quizData?.data.length) {
            setSelectedQuizIds([]);
        } else {
            setSelectedQuizIds(quizData?.data.map((quiz) => quiz.id) || []);
        }
    };

    // Подготовка данных для графика
    const chartData = useMemo(() => {
        const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const currentYear = new Date().getFullYear();

        const realDataMap = new Map<number, { totalSessions: number; completedSessions: number }>();

        if (statsData?.sessionsByYear) {
            statsData.sessionsByYear.forEach((item) => {
                const displayYear = item.year - 1;
                realDataMap.set(displayYear, {
                    totalSessions: item.totalSessions,
                    completedSessions: item.completedSessions,
                });
            });
        }

        const totalData: number[] = [];
        const completedData: number[] = [];

        years.forEach((year) => {
            let total = 0;
            let completed = 0;

            // Для годов до 2024 (не включая) используем мок данные
            if (year < 2024) {
                const mockYearData = MOCK_DATA[year] || {totalSessions: 0, completedSessions: 0};
                total = mockYearData.totalSessions;
                completed = mockYearData.completedSessions;
            }

            // Если есть реальные данные за этот год, добавляем их
            // Для 2023 года и позже данные плюсуются
            if (realDataMap.has(year)) {
                const realYear = realDataMap.get(year)!;
                if (year >= 2023) {
                    // Для 2023 и позже: мок + реальные данные
                    total += realYear.totalSessions;
                    completed += realYear.completedSessions;
                } else {
                    // Для годов до 2023: только мок данные (уже установлены выше)
                }
            }

            // Не показываем данные за будущие годы (относительно текущего года - 1)
            if (year > currentYear - 1) {
                total = 0;
                completed = 0;
            }

            totalData.push(total);
            completedData.push(completed);
        });

        return {
            labels: years.map(String),
            datasets: [
                {
                    label: "Total quantity respondents to whom sent Survey",
                    data: totalData,
                    backgroundColor: "rgba(54, 162, 235)",
                },
                {
                    label: "Number of respondents who voted",
                    data: completedData,
                    backgroundColor: "#ffb138",
                },
            ],
        };
    }, [statsData]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    if (quizLoading) return <Loader/>;

    return (
        <div className="combined-statistics page">
            <UITitle
                title="Combined Statistics"
                subtitle="Select surveys to see combined statistics by years"
            />

            <div className="combined-statistics__controls">
                <div className="quiz-selector">
                    <div className="quiz-selector__header">
                        <h3>Select Surveys:</h3>
                        <button
                            className="select-all-button"
                            onClick={handleSelectAll}
                        >
                            {selectedQuizIds.length === quizData?.data.length
                                ? "Deselect All"
                                : "Select All"}
                        </button>
                    </div>
                    <div className="quiz-selector__list">
                        {quizData?.data.map((quiz) => (
                            <label key={quiz.id} className="quiz-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedQuizIds.includes(quiz.id)}
                                    onChange={() => handleQuizToggle(quiz.id)}
                                />
                                <span className="quiz-checkbox__title">{quiz.title}</span>
                                <span className="quiz-checkbox__status">{quiz.status}</span>
                            </label>
                        ))}
                    </div>
                    {selectedQuizIds.length > 0 && (
                        <div className="quiz-selector__footer">
                            Selected: {selectedQuizIds.length} survey(s)
                        </div>
                    )}
                </div>
            </div>

            {selectedQuizIds.length > 0 && (
                <div className="combined-statistics__content">
                    {statsLoading ? (
                        <Loader/>
                    ) : (
                        <>
                            <div className="combined-statistics__summary">
                                <div className="stat-card">
                                    <h3>Total Sessions (All Time)</h3>
                                    <p>{statsData?.totalSessions || 0}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Completed Sessions (All Time)</h3>
                                    <p>{statsData?.completedSessions || 0}</p>
                                </div>
                            </div>

                            <div className="combined-statistics__chart">
                                <h3>Statistics by Year</h3>
                                <Suspense fallback={<Loader/>}>
                                    <LazyBar data={chartData} options={chartOptions}/>
                                </Suspense>
                            </div>
                        </>
                    )}
                </div>
            )}

            {selectedQuizIds.length === 0 && (
                <div className="combined-statistics__empty">
                    <p>Please select at least one survey to see statistics</p>
                </div>
            )}
        </div>
    );
};

export default CombinedStatisticsPage;
