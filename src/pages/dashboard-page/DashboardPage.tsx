import {FC, useState} from "react";
import {Link} from "react-router-dom";
import {
    useCreateQuizMutation,
    useGetAllQuizQuery,
} from "@store/api/quiz-api.ts";
import QuizCard from "@components/Quiz/quiz-card/quiz-card.tsx";
import {CreateQuizModal} from "@components/Quiz";
import "./DashboardPage.css";
import UITitle from "@src/components/Base UI/UITitle";
import toast from "react-hot-toast";
import {ErrorResponse, QuizStatus} from "@src/interfaces";
import {Loader} from "@src/components";
import {Pagination} from "@components";

const DashboardPage: FC = () => {
    //LOCAL STATE
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<QuizStatus | null>(null);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // API
    const {data, isLoading, isError, error} = useGetAllQuizQuery({
        page: currentPage,
        perPage: 10,
        status: selectedStatus,
    });
    const [create] = useCreateQuizMutation();

    // HANDLERS
    const onSubmit = async (quizData: {
        title: string;
        tags: string[];
    }) => {
        try {
            await create(quizData).unwrap();
            closeModal();
            window.location.reload();
        } catch (err: unknown) {
            const error = err as ErrorResponse;

            if (error?.status === 403) {
                toast.error("Не хватает прав для создания теста!");
            }

            toast.error(`${error.data?.message}`);
            console.error("Failed to create quiz:", err);
        }
    };
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const {value} = event.target;
        if (value === "Все") {
            setSelectedStatus(null);
        } else {
            setSelectedStatus(value as QuizStatus);
        }
    };
    const onPageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    if (isLoading) return <Loader/>;
    if (isError) {
        console.error(error);
        return (
            <div className="loading">Произошла ошибка: {JSON.stringify(error)}</div>
        );
    }

    return (
        <div className="dashboard page">
            <UITitle title="All Surveys" subtitle="All surveys of our organization"/>
            <div className="dashboard__action">
                <button type="submit" className="dashboard__button" onClick={openModal}>
                    New survey
                </button>
                <Link to="/combined-statistics" className="dashboard__button dashboard__button--secondary">
                    Combined Statistics
                </Link>
                <div className="select-container">
                    <select className="select-custom" onChange={handleStatusChange}>
                        <option value="Все">All</option>
                        <option value={QuizStatus.ACTIVE}>Active</option>
                        <option value={QuizStatus.INACTIVE}>Inactive</option>
                        <option value={QuizStatus.DRAFT}>Draft</option>
                    </select>
                </div>
            </div>
            <section className="dashboard__content">
                {data?.data.map((item) => (
                    <QuizCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        tags={item.tags}
                        status={item.status}
                        createdAt={item.createdAt}
                    />
                ))}
            </section>
            {data && (
                <Pagination
                    meta={data.meta}
                    visiblePages={10}
                    onPageChange={onPageChange}
                />
            )}
            <CreateQuizModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={onSubmit}
            />
        </div>
    );
};

export default DashboardPage;
