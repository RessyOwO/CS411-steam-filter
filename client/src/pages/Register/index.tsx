import { BaseSyntheticEvent, useState } from "react";
import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  VStack,
  Text,
  Heading,
  Flex,
  useToast,
  Link,
  FormControl,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  FormErrorMessage,
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorModeValue,
  AbsoluteCenter,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Links = ["Register", "Login", "Profile", "Search"];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    as={RouterLink}
    to={"/" + children.toLowerCase()}
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
  >
    {children}
  </Link>
);

const Register = (): React.ReactElement => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [deviceBackground, setDeviceBackground] = useState("Windows");
  const [showPassword, setShowPassword] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleUsernameChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setUsernameError(true);
    } else {
      setUsername(event.target.value);
      setUsernameError(false);
    }
  };

  const handlePasswordChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setPasswordError(true);
    } else {
      setPassword(event.target.value);
      setPasswordError(false);
    }
  };

  const handleEmailChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setEmailError(true);
    } else {
      setEmail(event.target.value);
      setEmailError(false);
    }
  };

  const handlePasswordClick = () => setShowPassword(!showPassword);

  const handleSubmit = (): void => {
    if (!usernameError && !passwordError && !emailError) {
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          device_background: deviceBackground,
        }),
      })
        .then((response) => {
          if (response.status === 200) {
            toast({
              title: "Registration successful",
              status: "success",
              position: "top",
              duration: 5000,
            });

            return response.json();
          } else {
            toast({
              title: "Registration failed",
              status: "error",
              position: "top",
              duration: 5000,
            });
          }
        })
        .then((json) => {
          localStorage.token = json.access_token;
          navigate("/profile");
        });
    }
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack
        align="unset"
        spacing="5"
        p="5"
        border="1px"
        borderColor="gray.100"
        minWidth={"50vw"}
      >
        <Heading size="lg">Register</Heading>

        <FormControl isRequired isInvalid={emailError}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            onChange={handleEmailChange}
            placeholder="Email"
          />
          <FormErrorMessage>Email is required.</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={usernameError}>
          <FormLabel>Username</FormLabel>
          <Input onChange={handleUsernameChange} placeholder="Username" />
          <FormErrorMessage>Username is required.</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={passwordError}>
          <FormLabel>Password</FormLabel>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={showPassword ? "text" : "password"}
              onChange={handlePasswordChange}
              placeholder="Password"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handlePasswordClick}>
                {showPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>Password is required.</FormErrorMessage>
        </FormControl>

        <FormControl as="fieldset" isRequired>
          <FormLabel as="legend">Device Platform</FormLabel>
          <RadioGroup defaultValue={"Windows"} onChange={setDeviceBackground}>
            <HStack spacing="24px">
              <Radio value="Windows">Windows</Radio>
              <Radio value="Mac">Mac</Radio>
              <Radio value="Linux">Linux</Radio>
            </HStack>
          </RadioGroup>
        </FormControl>

        <Button onClick={handleSubmit}>Register</Button>

        <Text>
          Already have an account?{" "}
          <Link as={RouterLink} to="/" color={"blue.400"}>
            Login here
          </Link>
          .
        </Text>
      </VStack>
    </Flex>
  );
};

export default Register;
