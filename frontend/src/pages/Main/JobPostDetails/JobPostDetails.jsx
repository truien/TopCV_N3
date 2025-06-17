import { useRef, useState, useEffect } from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import coverPhoto from "../../../assets/images/company_cover.jpg";
import styles from "./JobPostDetails.module.css";
import RelatedJobs from "../../../components/RelatedJobs/RelatedJobs";
import logo from "../../../assets/images/avatar-default.jpg";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { getJobDetail, getCompanyJobs, getRelatedJobs } from "@/api/jobApi";
import { hassApplied, applyJob } from "@/api/applicationApi";
import { checkHasCV } from "@/api/userApi";
import { reportJob } from "@/api/reportApi";
import {
  followEmployer,
  unfollowEmployer,
  isFollowingEmployer,
} from "@/api/followApi";
import { saveJob } from "@/api/saveJobApi";
import JobPostReviews from "../../../components/JobPostReviews/JobPostReviews";

import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaRegCalendarAlt,
  FaRegPaperPlane,
  FaRegHeart,
  FaUserFriends,
} from "react-icons/fa";
import { FaCircleQuestion } from "react-icons/fa6";
import DOMPurify from "dompurify";
import { useParams } from "react-router-dom";
import easyapply from "../../../assets/images/easy-apply.png";
function JobPostDetails() {
  const { id } = useParams();
  const [jobPost, setJobPost] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState(null);
  const [companyJobs, setCompanyJobs] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const detailsRef = useRef(null);
  const companyJobsRef = useRef(null);
  const relatedJobsRef = useRef(null);
  const reviewsRef = useRef(null);
  const JobDetailCache = {};
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [hasCV, setHasCV] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await getJobDetail(id);
        setJobPost(data);
      } catch (err) {
        console.error("Lỗi tải job:", err);
      }
    };
    if (id) fetchJob();
  }, [id]);
  useEffect(() => {
    const handleScroll = () => {
      const sectionRefs = [
        { id: "details", ref: detailsRef },
        { id: "companyJobs", ref: companyJobsRef },
        { id: "relatedJobs", ref: relatedJobsRef },
        { id: "reviews", ref: reviewsRef },
      ];

      for (const section of sectionRefs) {
        const rect = section.ref.current.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const jobs = await getCompanyJobs(jobPost.employerId);
        setCompanyJobs(jobs);
        const follow = await isFollowingEmployer(jobPost.employerId);
        setIsFollowing(follow);
      } catch (err) {
        console.error("Lỗi job công ty:", err);
      }
    };
    if (jobPost?.employerId) fetchCompany();
  }, [jobPost]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await getRelatedJobs({
          excludeId: jobPost.id,
          location: jobPost.location,
          employment: jobPost.employment?.[0],
          fiels: jobPost.fields?.[0],
          limitted: 10,
        });
        setRelatedJobs(res);
      } catch (err) {
        console.error("Lỗi job liên quan:", err);
      }
    };
    if (jobPost?.fields && jobPost?.employment) fetchRelated();
  }, [jobPost]);
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const has = await checkHasCV();
        setHasCV(has.hasCv); // Sử dụng đúng thuộc tính API trả về
        setCvFile(has.cvFile); // Sử dụng đúng thuộc tính API trả về
        console.log("CVFile đã tải về: ", has);
        const res = await hassApplied(id);
        setHasApplied(res?.hasApplied);
      } catch (error) {
        console.error("Lỗi kiểm tra CV:", error);
        setHasApplied(false);
        setHasCV(false);
      }
    };
    checkStatus();
  }, [id]);

  const prefetchJobDetail = async (id) => {
    if (!JobDetailCache[id]) {
      try {
        const data = await getJobDetail(id);
        JobDetailCache[id] = data;
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      }
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason) return toast.warning("Chọn lý do báo cáo");

    try {
      await reportJob({
        jobPostId: jobPost.id,
        reason: reportReason,
        description: reportDescription,
      });
      toast.success("Gửi báo cáo thành công");
      setShowReportModal(false);
    } catch {
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập");
      } else {
        toast.error("Lỗi khi gửi báo cáo");
      }
    }
  };
  const handleApplyJob = async () => {
    const formData = new FormData();
    formData.append("jobId", jobPost.id);
    if (hasCV) {
      formData.append("cvFilePath", cvFile);
    } else if (cvFile instanceof File) {
      formData.append("cvFile", cvFile);
    } else {
      toast.warning("Bạn cần tải lên CV để ứng tuyển!");
      return;
    }

    try {
      await applyJob(formData);
      toast.success("Ứng tuyển thành công!");
      setHasApplied(true);
      setShowModal(false);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để ứng tuyển!");
      } else {
        console.error("Lỗi khi ứng tuyển:", error);
        toast.error("Không thể ứng tuyển. Vui lòng thử lại.");
      }
    }
  };

  if (!jobPost) {
    return (
      <div className="text-center mt-5">
        <p>Đang tải thông tin...</p>
        <div className="spinner-border " role="status">
          <span className="sr-only">Loading...</span>
        </div>
        {/* <div class='spinner-grow text-success' role='status'>
                    <span class='visually-hidden'>Loading...</span>
                </div> */}
      </div>
    );
  }

  const handleFollowEmployer = async () => {
    try {
      if (isFollowing) {
        await unfollowEmployer(jobPost.employerId);
        toast.info("Đã bỏ theo dõi.");
        setIsFollowing(false);
      } else {
        await followEmployer(jobPost.employerId);
        toast.success("Đã theo dõi công ty.");
        setIsFollowing(true);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để theo dõi công ty!");
      } else {
        toast.error("Lỗi khi theo dõi công ty.");
      }
    }
  };

  const handleSaveJob = async () => {
    try {
      await saveJob(jobPost.id);
      toast.success("Đã lưu tin tuyển dụng!");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.info("Bạn đã lưu tin này rồi.");
      }
      else if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để lưu tin tuyển dụng!");
      }
      else {
        toast.error("Lỗi khi lưu tin.");
      }
    }
  };

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <Header />
      <div className={styles["bg_customer"] + " p-3"}>
        <div className={" container "}>
          <section
            className={
              styles["bg_company"] + "  company_info position-relative rounded"
            }
          >
            <div className="coverphoto ">
              <img src={coverPhoto} alt="Logo" className=" w-100 " />
            </div>
            <div className={styles["top"] + " position-absolute start-0 ms-5 "}>
              <img
                src={jobPost.employer.avatar || logo}
                alt="Logo"
                className={`${styles["logo"]}`}
                height={150}
                width={150}
              />
            </div>
            <div className="d-flex p-5 ms-5 justify-content-between ">
              <div
                className={
                  styles["ps_6"] + " copany_name text-light ms-5 d-block"
                }
              >
                <span className="fs-4">{jobPost.employer.companyName}</span>
                <div className="d-flex align-content-center">
                  <FaUserFriends
                    style={{
                      fontSize: "20px",
                    }}
                    className="me-2"
                  />
                  {jobPost.employer.follower} follower
                </div>
              </div>
              <div className="folow btn">
                <button
                  className={styles["btnfollow"] + " p-2"}
                  onClick={handleFollowEmployer}
                >
                  {isFollowing ? "✓ Đã theo dõi" : "+ Theo dõi công ty"}
                </button>
              </div>
            </div>
          </section>
          <div className={`card mt-3 ${styles.jobCard}`}>
            <div className="card-body">
              <h5 className={`${styles.jobCard_card_title}`}>
                {jobPost.title}
              </h5>

              {/* Thông tin chi tiết */}
              <div className="d-flex justify-content-between align-items-center my-3">
                {/* Mức lương */}
                <div className="d-flex align-items-center">
                  <FaMoneyBillWave className={styles.jobCard_icon} />
                  <span className="ms-2">{jobPost.salaryRange}</span>
                </div>

                {/* Địa điểm */}
                <div className="d-flex align-items-center">
                  <FaMapMarkerAlt className={styles.jobCard_icon} />
                  <span className="ms-2">{jobPost.location}</span>
                </div>

                {/* Kinh nghiệm */}
                <div className="d-flex align-items-center">
                  <FaBriefcase className={styles.jobCard_icon} />
                  <span className="ms-2">Không yêu cầu kinh nghiệm</span>
                </div>
              </div>

              {/* Hạn nộp hồ sơ */}
              <div className="text-muted my-3 d-flex align-items-center">
                <FaRegCalendarAlt className={styles.jobCard_icon} />
                <span className="ms-2">
                  Hạn nộp hồ sơ: {jobPost.applyDeadline}
                </span>
              </div>

              {/* Nút hành động */}
              <div className="d-flex justify-content-start">
                {hasApplied ? (
                  <button className={styles["btnapply"] + " btn me-3"}>
                    <FaRegPaperPlane className="me-2" />
                    Bạn đã ứng tuyển bài viết này
                  </button>
                ) : (
                  <button
                    className={styles["btnapply"] + " btn me-3"}
                    onClick={() => setShowModal(true)}
                  >
                    <FaRegPaperPlane className="me-2" />
                    Ứng tuyển ngay
                  </button>
                )}

                <button
                  className={styles["btnsave"] + " btn"}
                  onClick={handleSaveJob}
                >
                  <FaRegHeart className="me-2" />
                  Lưu tin
                </button>
              </div>
            </div>
          </div>
          <nav className=" navbar sticky-top mt-3 bg-body w-auto">
            <div>
              <div
                onClick={() => scrollToSection(detailsRef)}
                className={`btn fw-bold me-3 ${
                  activeSection === "details" ? styles["activite"] : ""
                }`}
              >
                Chi tiết công việc
              </div>
              <div
                onClick={() => scrollToSection(companyJobsRef)}
                className={`btn fw-bold me-3 ${
                  activeSection === "companyJobs" ? styles["activite"] : ""
                }`}
              >
                Việc làm khác của công ty
              </div>{" "}
              <div
                onClick={() => scrollToSection(relatedJobsRef)}
                className={`btn fw-bold me-3 ${
                  activeSection === "relatedJobs" ? styles["activite"] : ""
                }`}
              >
                Việc làm liên quan
              </div>
              <div
                onClick={() => scrollToSection(reviewsRef)}
                className={`btn fw-bold ${
                  activeSection === "reviews" ? styles["activite"] : ""
                }`}
              >
                Đánh giá
              </div>
            </div>
          </nav>

          <div className="row">
            <div className="col-8">
              <section
                ref={detailsRef}
                className={styles["boder_custum"] + " section mt-3"}
              >
                <div className={`container ${styles.jobDetailsContainer}`}>
                  <h5 className={styles["title"]}>Chi tiết tin tuyển dụng</h5>

                  <div className="my-3">
                    {jobPost.fields &&
                      Array.isArray(jobPost.fields) &&
                      jobPost.fields.map((field, index) => (
                        <button
                          key={index}
                          className="btn btn-outline-secondary btn-sm me-2"
                        >
                          {field}
                        </button>
                      ))}
                    {jobPost.employment &&
                      Array.isArray(jobPost.employment) &&
                      jobPost.employment.map((employment, index) => (
                        <button
                          key={index}
                          className="btn btn-outline-secondary btn-sm me-2"
                        >
                          {employment}
                        </button>
                      ))}
                  </div>

                  {/* Mô tả công việc */}
                  <div className="my-4">
                    <h6 className="text-black fw-medium">Mô tả công việc</h6>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(jobPost.jobDescription),
                      }}
                    ></div>
                  </div>

                  {/* Yêu cầu ứng viên */}
                  <div className="my-4">
                    <h6 className="text-black fw-medium">Yêu cầu ứng viên</h6>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(jobPost.requirements),
                      }}
                    ></div>
                  </div>

                  {/* Quyền lợi */}
                  <div className="my-4">
                    <h6 className="text-black fw-medium">Quyền lợi</h6>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(jobPost.interest),
                      }}
                    ></div>
                  </div>

                  {/* Địa điểm làm việc */}
                  <div className="my-4">
                    <h6 className="text-black fw-medium">Địa điểm làm việc</h6>
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-success" />
                      <p className="mb-0">{jobPost.location}</p>
                    </div>
                  </div>

                  {/* Hạn nộp hồ sơ */}
                  <div className="my-4">
                    <h6 className="text-black fw-medium">
                      Cách thức ứng tuyển
                    </h6>
                    <p>
                      - Ứng viên vui lòng nộp hồ sơ trực tiếp tại phần ứng tuyển
                      ngay dưới đây.
                    </p>
                    <p className="text-muted d-flex align-items-center">
                      <FaRegCalendarAlt className="me-2" /> Hạn nộp hồ sơ:{" "}
                      {jobPost.applyDeadline}
                    </p>
                  </div>

                  {/* Nút hành động */}
                  <div className="my-4 d-flex ">
                    {hasApplied ? (
                      <button
                        className={
                          styles["jobDetailsContainer_btn"] +
                          " btn btn-success me-3"
                        }
                      >
                        Bạn đã ứng tuyển bài viết này
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowModal(true)}
                        className={
                          styles["jobDetailsContainer_btn"] +
                          " btn btn-success me-3"
                        }
                      >
                        Ứng tuyển ngay
                      </button>
                    )}

                    <button
                      className={
                        styles["jobDetailsContainer_btn"] +
                        " btn btn-outline-success"
                      }
                      onClick={handleSaveJob}
                    >
                      Lưu tin
                    </button>
                  </div>
                </div>
              </section>

              <section
                ref={companyJobsRef}
                className={styles["boder_custum"] + " section mt-3 p-3"}
              >
                <h5 className={styles["title"]}>Việc khác của công ty</h5>
                {companyJobs ? (
                  companyJobs
                    .filter((job) => job.id !== jobPost.id)
                    .map((job) => (
                      <RelatedJobs
                        key={job.id}
                        job={job}
                        fetchJobDetail={prefetchJobDetail}
                        JobDetailCache={JobDetailCache}
                      />
                    ))
                ) : (
                  <div>Đang tải dữ liệu</div>
                )}
              </section>

              <section
                ref={relatedJobsRef}
                className={styles["boder_custum"] + " section mt-3 p-3"}
              >
                <h5 className={styles["title"]}>Việc làm liên quan</h5>
                {relatedJobs ? (
                  relatedJobs.map((job) => (
                    <RelatedJobs
                      key={job.id}
                      job={job}
                      fetchJobDetail={prefetchJobDetail}
                      JobDetailCache={JobDetailCache}
                    />
                  ))
                ) : (
                  <div>Đang tải dữ liệu</div>
                )}
              </section>

              {/* Reviews Section */}
              <section
                ref={reviewsRef}
                className={styles["boder_custum"] + " section mt-3 p-3"}
              >
                {" "}
                <JobPostReviews jobPostId={jobPost?.id} currentUserId={1} />
              </section>
            </div>
            <div className="col-4 mt-3">
              <div className={styles["box-report-job"]}>
                <div className="d-flex">
                  <div>
                    <FaCircleQuestion
                      className="align-middle me-1"
                      style={{
                        color: "#00b14f",
                        fontSize: "17px",
                      }}
                    />
                  </div>
                  <h3 className={styles["Title"]}>Bí kíp Tìm việc an toàn</h3>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    fontStyle: "normal",
                    lineHeight: "22px",
                    marginBottom: "16px",
                  }}
                >
                  Dưới đây là những dấu hiệu của các tổ chức, cá nhân tuyển dụng
                  không minh bạch:
                </p>
                <section>
                  <h4 className={styles["common-signal__title"]}>
                    1. Dấu hiệu phổ biến:
                  </h4>
                  <div
                    id="carouselExampleIndicators"
                    className="carousel slide"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-indicators">
                      <button
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to="0"
                        className="active"
                        aria-current="true"
                        aria-label="Slide 1"
                      ></button>
                      <button
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to="1"
                        aria-label="Slide 2"
                      ></button>
                      <button
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to="2"
                        aria-label="Slide 3"
                      ></button>
                      <button
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to="3"
                        aria-label="Slide 4"
                      ></button>
                      <button
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to="4"
                        aria-label="Slide 5"
                      ></button>
                      <button
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to="5"
                        aria-label="Slide 6"
                      ></button>
                    </div>
                    <div className="carousel-inner">
                      <div className="carousel-item active">
                        <div className="slider__item">
                          <img
                            className="slider__image entered loaded"
                            src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/report/1.png"
                            alt="Item 1"
                          />
                          <p className={styles["slider__caption"]}>
                            Nội dung mô tả công việc sơ sài, không đồng nhất với
                            công việc thực tế
                          </p>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <div className="slider__item">
                          <img
                            className="slider__image entered loaded"
                            src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/report/2.png"
                            alt="Item 2"
                          />
                          <p className={styles["slider__caption"]}>
                            Hứa hẹn "việc nhẹ lương cao", không cần bỏ nhiều
                            công sức dễ dàng lấy tiền "khủng"
                          </p>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <div className="slider__item">
                          <img
                            className="slider__image entered loaded"
                            src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/report/3.png"
                            alt="Item 3"
                          />
                          <p className={styles["slider__caption"]}>
                            Yêu cầu tải app, nạp tiền, làm nhiệm vụ không rõ
                            ràng
                          </p>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <div className="slider__item">
                          <img
                            className="slider__image entered loaded"
                            src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/report/4.png"
                            alt="Item 4"
                          />
                          <p className={styles["slider__caption"]}>
                            Yêu cầu nộp phí phỏng vấn, phí giữ chỗ không rõ ràng
                            hoặc quá cao
                          </p>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <div className="slider__item">
                          <img
                            className="slider__image entered loaded"
                            src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/report/5.png"
                            alt="Item 5"
                          />
                          <p className={styles["slider__caption"]}>
                            Yêu cầu ký kết giấy tờ không rõ ràng hoặc nộp giấy
                            tờ gốc
                          </p>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <div className="slider__item">
                          <img
                            className="slider__image entered loaded"
                            src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/report/6.png?v=1.0.0"
                            alt="Item 6"
                          />
                          <p className={styles["slider__caption"]}>
                            Địa điểm phỏng vấn bất bình thường hoặc không có địa
                            chỉ cụ thể
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target="#carouselExampleIndicators"
                      data-bs-slide="prev"
                    >
                      <span
                        className="carousel-control-prev-icon"
                        aria-hidden="true"
                      ></span>
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target="#carouselExampleIndicators"
                      data-bs-slide="next"
                    >
                      <span
                        className="carousel-control-next-icon"
                        aria-hidden="true"
                      ></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </div>
                  <h4 className={styles["common-signal__title"]}>
                    2. Cần làm gì khi gặp việc làm, công ty không minh bạch::
                  </h4>
                  <div className="common-signal__content">
                    <ul>
                      <li
                        className="mb-3"
                        style={{
                          fontSize: "14px",
                          letterSpacing: ".14px",
                          lineHeight: "22px",
                        }}
                      >
                        Kiểm tra thông tin về công ty, việc làm trước khi ứng
                        tuyển
                      </li>
                      <li
                        className="mb-3"
                        style={{
                          fontSize: "14px",
                          letterSpacing: ".14px",
                          lineHeight: "22px",
                        }}
                      >
                        Báo cáo tin tuyển dụng với TopCV thông qua nút{" "}
                        <strong>"Báo cáo tin tuyển dụng"</strong> để được hỗ trợ
                        và giúp các ứng viên khác tránh được rủi ro
                      </li>
                      <li
                        className="mb-3"
                        style={{
                          fontSize: "14px",
                          letterSpacing: ".14px",
                          lineHeight: "22px",
                        }}
                      >
                        Hoặc liên hệ với TopCV thông qua kênh hỗ trợ ứng viên
                        của TopCV:
                        <br />
                        Email:{" "}
                        <a
                          className="text-highlight"
                          href="mailto:trongtruyen04@gmail.com"
                          style={{
                            color: "#00b14f",
                            textDecoration: "none",
                          }}
                        >
                          trongtruyen04@gmail.com
                        </a>
                        <br />
                        Hotline:{" "}
                        <a
                          className="text-highlight"
                          href="tel:0559330875"
                          style={{
                            color: "#00b14f",
                            textDecoration: "none",
                          }}
                        >
                          0559330875
                        </a>
                        <br />
                      </li>
                    </ul>
                  </div>
                  <div className="d-flex justify-content-center">
                    <Button
                      variant="outline-danger"
                      onClick={() => setShowReportModal(true)}
                    >
                      Báo cáo tin tuyển dụng
                    </Button>
                  </div>
                </section>
              </div>
              <div className="mt-2">
                <img
                  src={easyapply}
                  alt="dễ dàng ứng tuyển"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className={styles["content-seo-box"] + " mt-3"}>
          <div id="seo-box">
            <p>
              <strong>
                Cơ hội ứng tuyển việc làm với đãi ngộ hấp dẫn tại các công ty
                hàng đầu
              </strong>
            </p>
            <p>
              Trước sự phát triển vượt bậc của nền kinh tế, rất nhiều ngành nghề
              trở nên khan hiếm nhân lực hoặc thiếu nhân lực giỏi. Vì vậy, hầu
              hết các trường Đại học đều liên kết với các công ty, doanh nghiệp,
              cơ quan để tạo cơ hội cho các bạn sinh viên được học tập, rèn
              luyện bản thân và làm quen với môi trường làm việc từ sớm. Trong{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2db14f",
                  textDecoration: "none",
                }}
              >
                <strong>danh sách việc làm </strong>
              </a>
              trên đây, TopCV mang đến cho bạn những cơ hội việc làm tại những
              môi trường làm việc năng động, chuyên nghiệp.
            </p>
            <p>
              <strong>Vậy tại sao nên tìm việc làm tại TopCV?</strong>
            </p>
            <p>
              <strong>Việc làm Chất lượng</strong>
            </p>
            <ul>
              <li>
                Hàng ngàn tin tuyển dụng chất lượng cao được cập nhật thường
                xuyên để đáp ứng nhu cầu tìm việc của ứng viên.
              </li>
              <li>
                Hệ thống thông minh tự động gợi ý các công việc phù hợp theo CV
                của bạn.
              </li>
            </ul>
            <p>
              <strong>Công cụ viết CV đẹp Miễn phí</strong>
            </p>
            <ul>
              <li>
                Nhiều mẫu CV đẹp, phù hợp nhu cầu ứng tuyển các vị trí khác
                nhau.
              </li>
              <li>
                Tương tác trực quan, dễ dàng chỉnh sửa thông tin, tạo CV online
                nhanh chóng trong vòng 5 phút.
              </li>
            </ul>
            <p>
              <strong>Hỗ trợ Người tìm việc</strong>
            </p>
            <ul>
              <li>
                Nhà tuyển dụng chủ động tìm kiếm và liên hệ với bạn qua hệ thống
                kết nối ứng viên thông minh.
              </li>
              <li>
                Báo cáo chi tiết Nhà tuyển dụng đã xem CV và gửi offer tới bạn.
              </li>
            </ul>
            <p>
              Tại{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2db14f",
                  textDecoration: "none",
                }}
              >
                <strong>TopCV</strong>
              </a>
              , bạn có thể tìm thấy những tin tuyển dụng việc làm với mức lương
              vô cùng hấp dẫn. Những nhà tuyển dụng kết nối với TopCV đều là
              những công ty lớn tại Việt Nam, nơi bạn có thể làm việc trong một
              môi trường chuyên nghiệp, năng động, trẻ trung. TopCV là nền tảng
              tuyển dụng công nghệ cao giúp các nhà tuyển dụng và ứng viên kết
              nối với nhau. Nhanh tay tạo CV để ứng tuyển vào các vị trí việc
              làm mới nhất hấp dẫn tại{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2db14f",
                  textDecoration: "none",
                }}
              >
                <strong>việc làm mới nhất tại Hà Nội</strong>
              </a>
              ,{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2db14f",
                  textDecoration: "none",
                }}
              >
                <strong>việc làm mới nhất tại TP.HCM</strong>
              </a>{" "}
              ở TopCV, bạn sẽ tìm thấy những{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2db14f",
                  textDecoration: "none",
                }}
              >
                <strong>việc làm mới nhất</strong>
              </a>{" "}
              với mức lương tốt nhất!
            </p>
          </div>
        </div>
      </div>
      <Footer />

      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Báo cáo bài tuyển dụng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label>Lý do</label>{" "}
            <select
              className="form-select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">-- Chọn lý do --</option>
              <option value="inappropriate_content">
                Nội dung không phù hợp
              </option>
              <option value="fake_job">Việc làm giả</option>
              <option value="spam">Spam</option>
              <option value="discrimination">Phân biệt đối xử</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Mô tả chi tiết (nếu có)</label>
            <textarea
              className="form-control"
              rows={4}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Bạn hãy mô tả lý do báo cáo..."
            ></textarea>
          </div>
          {showModal && (
            <div
              className="modal show fade d-block"
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Xác nhận ứng tuyển</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    {hasCV ? (
                      <p>
                        Bạn đã có CV trong hệ thống. Xác nhận để ứng tuyển ngay.
                      </p>
                    ) : (
                      <>
                        <label className="form-label">
                          Tải lên CV (PDF/DOC):
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="form-control"
                          onChange={(e) => setCvFile(e.target.files[0])}
                        />
                        <p className="text-danger small mt-2">
                          Bạn chưa có CV. Vui lòng tải lên để tiếp tục.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={handleApplyJob}
                    >
                      Xác nhận ứng tuyển
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleSubmitReport}>
            Gửi báo cáo
          </Button>
        </Modal.Footer>
      </Modal>
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận ứng tuyển</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {hasCV ? (
                  <p>
                    Bạn đã có CV trong hệ thống. Xác nhận để ứng tuyển ngay.
                  </p>
                ) : (
                  <>
                    <label className="form-label">Tải lên CV (PDF/DOC):</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="form-control"
                      onChange={(e) => setCvFile(e.target.files[0])}
                    />
                    <p className="text-danger small mt-2">
                      Bạn chưa có CV. Vui lòng tải lên để tiếp tục.
                    </p>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button className="btn btn-success" onClick={handleApplyJob}>
                  Xác nhận ứng tuyển
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default JobPostDetails;
