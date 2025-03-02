from typing import List, Optional

from sqlalchemy import Column, DECIMAL, Date, Enum, ForeignKeyConstraint, Index, Integer, String, TIMESTAMP, Table, Text, text
from sqlalchemy.dialects.mysql import TINYINT
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import datetime
import decimal

class Base(DeclarativeBase):
    pass


class EmploymentTypes(Base):
    __tablename__ = 'employment_types'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

    job_post_employment_types: Mapped[List['JobPostEmploymentTypes']] = relationship('JobPostEmploymentTypes', back_populates='employment_type')


class JobFields(Base):
    __tablename__ = 'job_fields'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

    job_post_fields: Mapped[List['JobPostFields']] = relationship('JobPostFields', back_populates='field')


class Packages(Base):
    __tablename__ = 'packages'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 2))
    duration_days: Mapped[int] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    job_post_promotions: Mapped[List['JobPostPromotions']] = relationship('JobPostPromotions', back_populates='package')


class ProFeatures(Base):
    __tablename__ = 'pro_features'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)

    pro_subscription: Mapped[List['ProSubscriptions']] = relationship('ProSubscriptions', secondary='pro_subscription_features', back_populates='pro_feature')


class UserRoles(Base):
    __tablename__ = 'user_roles'
    __table_args__ = (
        Index('name', 'name', unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    users: Mapped[List['Users']] = relationship('Users', back_populates='role_')


class Users(Base):
    __tablename__ = 'users'
    __table_args__ = (
        ForeignKeyConstraint(['role_id'], ['user_roles.id'], name='fk_users_role'),
        Index('email', 'email', unique=True),
        Index('facebook_id', 'facebook_id', unique=True),
        Index('fk_users_role', 'role_id'),
        Index('google_id', 'google_id', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(Enum('candidate', 'recruiter', 'admin'))
    role_id: Mapped[int] = mapped_column(Integer)
    password: Mapped[Optional[str]] = mapped_column(String(255))
    google_id: Mapped[Optional[str]] = mapped_column(String(255))
    facebook_id: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    role_: Mapped['UserRoles'] = relationship('UserRoles', back_populates='users')
    candidate_profiles: Mapped[List['CandidateProfiles']] = relationship('CandidateProfiles', back_populates='user')
    company_profiles: Mapped[List['CompanyProfiles']] = relationship('CompanyProfiles', back_populates='user')
    job_posts: Mapped[List['JobPosts']] = relationship('JobPosts', back_populates='employer')
    notifications: Mapped[List['Notifications']] = relationship('Notifications', back_populates='user')
    oauth_accounts: Mapped[List['OauthAccounts']] = relationship('OauthAccounts', back_populates='user')
    pro_subscriptions: Mapped[List['ProSubscriptions']] = relationship('ProSubscriptions', back_populates='user')
    user_follows: Mapped[List['UserFollows']] = relationship('UserFollows', foreign_keys='[UserFollows.employer_id]', back_populates='employer')
    user_follows_: Mapped[List['UserFollows']] = relationship('UserFollows', foreign_keys='[UserFollows.user_id]', back_populates='user')
    user_tokens: Mapped[List['UserTokens']] = relationship('UserTokens', back_populates='user')
    applications: Mapped[List['Applications']] = relationship('Applications', back_populates='user')


class AdminUsers(Users):
    __tablename__ = 'admin_users'
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='admin_users_ibfk_1'),
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)


class CandidateProfiles(Base):
    __tablename__ = 'candidate_profiles'
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='candidate_profiles_ibfk_1'),
        Index('user_id', 'user_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    phone: Mapped[Optional[str]] = mapped_column(String(15))
    address: Mapped[Optional[str]] = mapped_column(Text)
    date_of_birth: Mapped[Optional[datetime.date]] = mapped_column(Date)
    gender: Mapped[Optional[str]] = mapped_column(Enum('male', 'female', 'other'))
    summary: Mapped[Optional[str]] = mapped_column(Text)
    experience: Mapped[Optional[str]] = mapped_column(Text)
    education: Mapped[Optional[str]] = mapped_column(Text)
    skills: Mapped[Optional[str]] = mapped_column(Text)
    cv_title: Mapped[Optional[str]] = mapped_column(String(255))
    cv_file_path: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    user: Mapped['Users'] = relationship('Users', back_populates='candidate_profiles')


class CompanyProfiles(Base):
    __tablename__ = 'company_profiles'
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='company_profiles_ibfk_1'),
        Index('user_id', 'user_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    company_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    website: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(String(255))

    user: Mapped['Users'] = relationship('Users', back_populates='company_profiles')


class JobPosts(Base):
    __tablename__ = 'job_posts'
    __table_args__ = (
        ForeignKeyConstraint(['employer_id'], ['users.id'], ondelete='CASCADE', name='job_posts_ibfk_1'),
        Index('employer_id', 'employer_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    requirements: Mapped[str] = mapped_column(Text)
    interest: Mapped[str] = mapped_column(Text)
    employer_id: Mapped[int] = mapped_column(Integer)
    salary_range: Mapped[Optional[str]] = mapped_column(String(50))
    location: Mapped[Optional[str]] = mapped_column(String(100))
    post_date: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    status: Mapped[Optional[str]] = mapped_column(Enum('open', 'closed'), server_default=text("'open'"))

    employer: Mapped['Users'] = relationship('Users', back_populates='job_posts')
    applications: Mapped[List['Applications']] = relationship('Applications', back_populates='job')
    job_post_employment_types: Mapped[List['JobPostEmploymentTypes']] = relationship('JobPostEmploymentTypes', back_populates='job_post')
    job_post_fields: Mapped[List['JobPostFields']] = relationship('JobPostFields', back_populates='job_post')
    job_post_promotions: Mapped[List['JobPostPromotions']] = relationship('JobPostPromotions', back_populates='job_post')


class Notifications(Base):
    __tablename__ = 'notifications'
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='notifications_ibfk_1'),
        Index('user_id', 'user_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[Optional[int]] = mapped_column(TINYINT(1), server_default=text("'0'"))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    user: Mapped['Users'] = relationship('Users', back_populates='notifications')


class OauthAccounts(Base):
    __tablename__ = 'oauth_accounts'
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='oauth_accounts_ibfk_1'),
        Index('provider_id', 'provider_id', unique=True),
        Index('user_id', 'user_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    provider: Mapped[str] = mapped_column(Enum('google', 'facebook'))
    provider_id: Mapped[str] = mapped_column(String(255))

    user: Mapped['Users'] = relationship('Users', back_populates='oauth_accounts')


class ProSubscriptions(Base):
    __tablename__ = 'pro_subscriptions'
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='pro_subscriptions_ibfk_1'),
        Index('user_id', 'user_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    start_date: Mapped[datetime.datetime] = mapped_column(TIMESTAMP)
    end_date: Mapped[datetime.datetime] = mapped_column(TIMESTAMP)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    pro_feature: Mapped[List['ProFeatures']] = relationship('ProFeatures', secondary='pro_subscription_features', back_populates='pro_subscription')
    user: Mapped['Users'] = relationship('Users', back_populates='pro_subscriptions')


class UserFollows(Base):
    __tablename__ = 'user_follows'
    __table_args__ = (
        ForeignKeyConstraint(['employer_id'], ['users.id'], ondelete='CASCADE', name='user_follows_ibfk_2'),
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='user_follows_ibfk_1'),
        Index('employer_id', 'employer_id')
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    employer_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    followed_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    employer: Mapped['Users'] = relationship('Users', foreign_keys=[employer_id], back_populates='user_follows')
    user: Mapped['Users'] = relationship('Users', foreign_keys=[user_id], back_populates='user_follows_')


class UserTokens(Base):
    __tablename__ = 'user_tokens'
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='user_tokens_ibfk_1'),
        Index('user_id', 'user_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    refresh_token: Mapped[str] = mapped_column(Text)
    expires_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP)

    user: Mapped['Users'] = relationship('Users', back_populates='user_tokens')


class Applications(Base):
    __tablename__ = 'applications'
    __table_args__ = (
        ForeignKeyConstraint(['job_id'], ['job_posts.id'], ondelete='CASCADE', name='applications_ibfk_2'),
        ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='applications_ibfk_1'),
        Index('job_id', 'job_id'),
        Index('user_id', 'user_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    job_id: Mapped[int] = mapped_column(Integer)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[Optional[str]] = mapped_column(Enum('pending', 'accepted', 'rejected'), server_default=text("'pending'"))
    applied_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    job: Mapped['JobPosts'] = relationship('JobPosts', back_populates='applications')
    user: Mapped['Users'] = relationship('Users', back_populates='applications')


class JobPostEmploymentTypes(Base):
    __tablename__ = 'job_post_employment_types'
    __table_args__ = (
        ForeignKeyConstraint(['employment_type_id'], ['employment_types.id'], ondelete='CASCADE', name='job_post_employment_types_ibfk_2'),
        ForeignKeyConstraint(['job_post_id'], ['job_posts.id'], ondelete='CASCADE', name='job_post_employment_types_ibfk_1'),
        Index('employment_type_id', 'employment_type_id')
    )

    job_post_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    employment_type_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    employment_type: Mapped['EmploymentTypes'] = relationship('EmploymentTypes', back_populates='job_post_employment_types')
    job_post: Mapped['JobPosts'] = relationship('JobPosts', back_populates='job_post_employment_types')


class JobPostFields(Base):
    __tablename__ = 'job_post_fields'
    __table_args__ = (
        ForeignKeyConstraint(['field_id'], ['job_fields.id'], ondelete='CASCADE', name='job_post_fields_ibfk_2'),
        ForeignKeyConstraint(['job_post_id'], ['job_posts.id'], ondelete='CASCADE', name='job_post_fields_ibfk_1'),
        Index('field_id', 'field_id')
    )

    job_post_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    field_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    field: Mapped['JobFields'] = relationship('JobFields', back_populates='job_post_fields')
    job_post: Mapped['JobPosts'] = relationship('JobPosts', back_populates='job_post_fields')


class JobPostPromotions(Base):
    __tablename__ = 'job_post_promotions'
    __table_args__ = (
        ForeignKeyConstraint(['job_post_id'], ['job_posts.id'], ondelete='CASCADE', name='job_post_promotions_ibfk_1'),
        ForeignKeyConstraint(['package_id'], ['packages.id'], ondelete='CASCADE', name='job_post_promotions_ibfk_2'),
        Index('job_post_id', 'job_post_id'),
        Index('package_id', 'package_id')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_post_id: Mapped[int] = mapped_column(Integer)
    package_id: Mapped[int] = mapped_column(Integer)
    start_date: Mapped[datetime.datetime] = mapped_column(TIMESTAMP)
    end_date: Mapped[datetime.datetime] = mapped_column(TIMESTAMP)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    job_post: Mapped['JobPosts'] = relationship('JobPosts', back_populates='job_post_promotions')
    package: Mapped['Packages'] = relationship('Packages', back_populates='job_post_promotions')


t_pro_subscription_features = Table(
    'pro_subscription_features', Base.metadata,
    Column('pro_subscription_id', Integer, primary_key=True, nullable=False),
    Column('pro_feature_id', Integer, primary_key=True, nullable=False),
    ForeignKeyConstraint(['pro_feature_id'], ['pro_features.id'], ondelete='CASCADE', name='pro_subscription_features_ibfk_2'),
    ForeignKeyConstraint(['pro_subscription_id'], ['pro_subscriptions.id'], ondelete='CASCADE', name='pro_subscription_features_ibfk_1'),
    Index('pro_feature_id', 'pro_feature_id')
)
