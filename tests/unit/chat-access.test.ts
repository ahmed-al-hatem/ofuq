import { USER_ROLES } from "@/constants/roles"
import {
  canAccessDashboardSchoolOfficeChat,
  canSendMessage,
  canViewConversation,
  getConversationPortalOwnerId,
  SCHOOL_OFFICE_CONVERSATION_TYPE,
  type ChatConversationAccessRecord,
  type DashboardChatContext,
  type PortalChatContext,
} from "@/lib/chat/policies"

describe("chat access helpers", () => {
  const dashboardContext: DashboardChatContext = {
    kind: "dashboard",
    user_id: "admin-user",
    role: USER_ROLES.SCHOOL_ADMIN,
    tenant_id: "tenant-1",
    school_id: "school-1",
    full_name: "مدير المدرسة",
    display_name: null,
  }

  const portalContext: PortalChatContext = {
    kind: "portal",
    user_id: "parent-user",
    role: USER_ROLES.PARENT,
    tenant_id: "tenant-1",
    school_id: "school-1",
    full_name: "ولي الأمر",
    display_name: null,
  }

  const schoolOfficeConversation: ChatConversationAccessRecord = {
    id: "conversation-1",
    tenant_id: "tenant-1",
    school_id: "school-1",
    type: SCHOOL_OFFICE_CONVERSATION_TYPE,
    metadata: {
      portal_user_id: "parent-user",
      portal_role: USER_ROLES.PARENT,
    },
    subject: "مراسلة إدارة المدرسة",
    status: "open",
    participant_user_ids: ["parent-user", "admin-user"],
  }

  it("restricts dashboard school-office chat to school admins", () => {
    expect(canAccessDashboardSchoolOfficeChat(USER_ROLES.SCHOOL_ADMIN)).toBe(true)
    expect(canAccessDashboardSchoolOfficeChat(USER_ROLES.SYSTEM_ADMIN)).toBe(false)
    expect(canAccessDashboardSchoolOfficeChat(USER_ROLES.TEACHER)).toBe(false)
    expect(canAccessDashboardSchoolOfficeChat(USER_ROLES.ACCOUNTANT)).toBe(false)
    expect(canAccessDashboardSchoolOfficeChat(USER_ROLES.LIBRARIAN)).toBe(false)
  })

  it("extracts the portal owner id from conversation metadata", () => {
    expect(getConversationPortalOwnerId(schoolOfficeConversation)).toBe(
      "parent-user"
    )
    expect(
      getConversationPortalOwnerId({
        metadata: {},
      })
    ).toBeNull()
  })

  it("allows school admin access to school-office conversations in the same school", () => {
    expect(canViewConversation(dashboardContext, schoolOfficeConversation)).toBe(
      true
    )
    expect(canSendMessage(dashboardContext, schoolOfficeConversation)).toBe(true)
  })

  it("allows portal users to access only their own conversation", () => {
    expect(canViewConversation(portalContext, schoolOfficeConversation)).toBe(true)
    expect(canSendMessage(portalContext, schoolOfficeConversation)).toBe(true)

    expect(
      canViewConversation(portalContext, {
        ...schoolOfficeConversation,
        metadata: {
          portal_user_id: "other-parent",
        },
        participant_user_ids: ["other-parent", "admin-user"],
      })
    ).toBe(false)
  })

  it("blocks sending when the conversation is not open", () => {
    expect(
      canSendMessage(portalContext, {
        ...schoolOfficeConversation,
        status: "archived",
      })
    ).toBe(false)
  })
})
