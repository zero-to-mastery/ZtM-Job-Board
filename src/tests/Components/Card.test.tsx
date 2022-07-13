import React from "react"
import { shallow, mount } from "enzyme"
import toJson from "enzyme-to-json"
import Card from "../../components/Card"

describe("Testing Card.tsx", () => {
  it("renders with correct mock data", () => {
    const mockUser = {
      id: "testId",
      img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.seekpng.com%2Fpng%2Fdetail%2F110-1100707_person-avatar-placeholder.png&f=1&nofb=1",
      name: "Test name",
      jobTitle: "React Intern",
      email: "testEmail@test.com",
      location: {
        city: "test city",
        state: "test state",
        country: "test country",
      },
      links: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        website: "https://google.com",
      },
    }
    expect.assertions(8)

    const wrapper = mount(<Card user={mockUser} />)

    expect(toJson(wrapper)).toMatchSnapshot()
    expect(wrapper.find(`p[className="title text-center"]`).text()).toEqual(
      "React Intern"
    )
    expect(
      wrapper
        .find(
          `h2[className="name mt3 mb1 ph3 w-100 flex items-center justify-center"]`
        )
        .text()
    ).toEqual("Test name")
    expect(wrapper.find(`a[title="email"]`).exists()).toEqual(true)
    expect(wrapper.find(`a[title="Website/Portfolio"]`).exists()).toEqual(true)
    expect(wrapper.find(`a[title="GitHub profile"]`).exists()).toEqual(true)
    expect(wrapper.find(`a[title="LinkedIn profile"]`).exists()).toEqual(true)
    expect(
      wrapper
        .find(
          `p[className="footer items-center justify-center br2 br--bottom"]`
        )
        .text()
    ).toEqual("test city, test state, test country")
  })

  it("skips the rest of data if id is missing", () => {
    const mockUser = {
      jobTitle: "mock job",
    }

    const wrapper = mount(<Card user={mockUser} />)

    expect.assertions(1)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it("can deal with the links parameter missing", () => {
    const mockUser = {
      id: "testId",
      name: "test name",
      jobTitle: "For sure not website owner",
      location: {
        city: "test city",
      },
    }

    const wrapper = mount(<Card user={mockUser} />)

    expect.assertions(1)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it("can render the location with country missing", () => {
    const mockUser = {
      id: "testId",
      location: {
        city: "test city",
        state: "test state",
      },
      links: {
        website: "testwebsite.com",
        github: "github.com",
        linkedin: "linkedin.com",
      },
    }
    expect.assertions(2)

    const wrapper = mount(<Card user={mockUser} />)
    expect(toJson(wrapper)).toMatchSnapshot()
    expect(
      wrapper
        .find(
          `p[className="footer items-center justify-center br2 br--bottom"]`
        )
        .text()
    ).toEqual("test city, test state")
  })

  it("can render the location with state missing", () => {
    const mockUser = {
      id: "testId",
      location: {
        city: "test city",
        country: "test country",
      },
      links: {
        website: "testwebsite.com",
        github: "github.com",
        linkedin: "linkedin.com",
      },
    }
    expect.assertions(2)

    const wrapper = mount(<Card user={mockUser} />)
    expect(toJson(wrapper)).toMatchSnapshot()
    expect(
      wrapper
        .find(
          `p[className="footer items-center justify-center br2 br--bottom"]`
        )
        .text()
    ).toEqual("test city, test country")
  })

  it("can render the location with city missing", () => {
    const mockUser = {
      id: "testId",
      location: {
        state: "test state",
        country: "test country",
      },
      links: {
        website: "testwebsite.com",
        github: "github.com",
        linkedin: "linkedin.com",
      },
    }
    expect.assertions(2)

    const wrapper = mount(<Card user={mockUser} />)
    expect(toJson(wrapper)).toMatchSnapshot()
    expect(
      wrapper
        .find(
          `p[className="footer items-center justify-center br2 br--bottom"]`
        )
        .text()
    ).toEqual("test state, test country")
  })

  it("renders nothing without data", () => {
    expect(toJson(shallow(<Card user={{}} />))).toMatchSnapshot()
  })
})
